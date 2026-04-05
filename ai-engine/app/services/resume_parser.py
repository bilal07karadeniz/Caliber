import re
import os
import logging
from typing import Optional

logger = logging.getLogger(__name__)

try:
    from pdfminer.high_level import extract_text as pdf_extract_text
    logger.info("pdfminer loaded successfully")
except ImportError:
    logger.warning("pdfminer is not installed - PDF parsing will be unavailable")
    pdf_extract_text = None

try:
    import docx
    logger.info("python-docx loaded successfully")
except ImportError:
    logger.warning("python-docx is not installed - DOCX parsing will be unavailable")
    docx = None

try:
    import spacy
    from app.core.config import settings
    nlp = spacy.load(settings.SPACY_MODEL)
    logger.info("spaCy model '%s' loaded successfully", settings.SPACY_MODEL)
except Exception as e:
    logger.warning("spaCy failed to load: %s - NER-based extraction will be unavailable", e)
    nlp = None


SKILL_PATTERNS = [
    "Python", "JavaScript", "TypeScript", "Java", "C\\+\\+", "C#", "Go", "Rust", "Ruby", "PHP", "Swift", "Kotlin",
    "React", "Angular", "Vue", "Next\\.js", "Node\\.js", "Express", "Django", "FastAPI", "Spring", "Flask",
    "HTML", "CSS", "Tailwind", "Bootstrap", "SASS", "LESS",
    "PostgreSQL", "MongoDB", "MySQL", "Redis", "SQLite", "Oracle", "SQL Server",
    "Docker", "Kubernetes", "AWS", "Azure", "GCP", "CI/CD", "Jenkins", "GitHub Actions",
    "Git", "Linux", "REST API", "GraphQL", "WebSocket", "gRPC",
    "Machine Learning", "Deep Learning", "NLP", "TensorFlow", "PyTorch", "Pandas", "NumPy", "Scikit-learn",
    "Agile", "Scrum", "Jira", "Figma", "Adobe", "Photoshop",
    "Communication", "Leadership", "Teamwork", "Problem Solving", "Project Management",
]

CERTIFICATION_KEYWORDS = [
    "AWS Certified", "Google Cloud Certified", "Google Cloud Professional",
    "PMP", "Project Management Professional",
    "Scrum Master", "CSM", "PSM",
    "CISSP", "CompTIA Security+", "CompTIA A+", "CompTIA Network+",
    "CKA", "Certified Kubernetes Administrator",
    "Azure Certified", "Microsoft Certified",
    "Oracle Certified", "Cisco Certified", "CCNA", "CCNP",
    "ITIL", "Six Sigma", "Lean Six Sigma",
    "CFA", "CPA", "PHR", "SHRM",
    "Salesforce Certified", "SAP Certified",
    "TensorFlow Developer Certificate", "HashiCorp Certified",
    "Red Hat Certified", "RHCE", "RHCSA",
]

DEGREE_PATTERNS = {
    r"\bPh\.?D\.?\b": "PhD",
    r"\bDoctorate\b": "PhD",
    r"\bMaster(?:'s|s)?\b": "Master's",
    r"\bM\.?Sc\.?\b": "M.Sc",
    r"\bM\.?A\.?\b": "M.A",
    r"\bMBA\b": "MBA",
    r"\bM\.?S\.?\b": "M.S",
    r"\bBachelor(?:'s|s)?\b": "Bachelor's",
    r"\bB\.?Sc\.?\b": "B.Sc",
    r"\bB\.?A\.?\b": "B.A",
    r"\bB\.?S\.?\b": "B.S",
    r"\bAssociate(?:'s|s)?\b": "Associate's",
    r"\bDiploma\b": "Diploma",
}

JOB_TITLE_PATTERNS = [
    "Software Engineer", "Software Developer", "Senior Software Engineer",
    "Frontend Developer", "Backend Developer", "Full Stack Developer",
    "Data Scientist", "Data Analyst", "Data Engineer",
    "DevOps Engineer", "Cloud Engineer", "SRE",
    "Product Manager", "Project Manager", "Program Manager",
    "Designer", "UX Designer", "UI Designer",
    "QA Engineer", "Test Engineer", "SDET",
    "Machine Learning Engineer", "AI Engineer",
    "Solutions Architect", "Technical Lead", "Engineering Manager",
    "CTO", "VP of Engineering", "Director of Engineering",
    "Intern", "Junior Developer", "Senior Developer",
    "Consultant", "Analyst", "Administrator",
]

EMAIL_PATTERN = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")
PHONE_PATTERN = re.compile(r"[\+]?[\d\s\-\(\)]{7,15}")
YEAR_PATTERN = re.compile(r"\b(19|20)\d{2}\b")
DATE_RANGE_PATTERN = re.compile(r"((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4})\s*[-\u2013]\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}|[Pp]resent|[Cc]urrent)", re.IGNORECASE)


class ResumeParser:
    def parse_pdf(self, file_path: str) -> str:
        if pdf_extract_text is None:
            return ""
        try:
            return pdf_extract_text(file_path)
        except Exception as e:
            logger.error("PDF parse error: %s", e)
            return ""

    def parse_docx(self, file_path: str) -> str:
        if docx is None:
            return ""
        try:
            doc = docx.Document(file_path)
            return "\n".join([p.text for p in doc.paragraphs])
        except Exception as e:
            logger.error("DOCX parse error: %s", e)
            return ""

    def parse_file(self, file_path: str) -> str:
        ext = os.path.splitext(file_path)[1].lower()
        if ext == ".pdf":
            return self.parse_pdf(file_path)
        elif ext in (".docx", ".doc"):
            return self.parse_docx(file_path)
        else:
            try:
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    return f.read()
            except Exception:
                return ""

    def extract_skills(self, text: str) -> list[str]:
        found = []
        # Fix 15: removed unused text_lower variable
        for skill in SKILL_PATTERNS:
            pattern = re.compile(r"\b" + skill + r"\b", re.IGNORECASE)
            if pattern.search(text):
                # Use the canonical form
                clean = skill.replace("\\+", "+").replace("\\.", ".")
                if clean not in found:
                    found.append(clean)
        return found

    def extract_email(self, text: str) -> str:
        match = EMAIL_PATTERN.search(text)
        return match.group(0) if match else ""

    def extract_phone(self, text: str) -> str:
        match = PHONE_PATTERN.search(text)
        return match.group(0).strip() if match else ""

    def extract_name(self, text: str) -> str:
        if nlp:
            doc = nlp(text[:1000])
            for ent in doc.ents:
                if ent.label_ == "PERSON":
                    return ent.text
        lines = text.strip().split("\n")
        for line in lines[:3]:
            clean = line.strip()
            if clean and len(clean.split()) <= 4 and not EMAIL_PATTERN.search(clean):
                return clean
        return ""

    def extract_education(self, text: str) -> list[dict]:
        """Fix 10: Improved education extraction with degree, field, and year parsing."""
        education = []
        edu_keywords = ["university", "college", "institute", "bachelor", "master", "phd", "degree", "b.sc", "m.sc", "b.a", "m.a", "mba"]
        lines = text.split("\n")
        for i, line in enumerate(lines):
            if any(kw in line.lower() for kw in edu_keywords):
                # Extract degree
                degree = ""
                for pattern, degree_name in DEGREE_PATTERNS.items():
                    if re.search(pattern, line, re.IGNORECASE):
                        degree = degree_name
                        break

                # Extract year (look for 4-digit year patterns)
                year = ""
                year_matches = YEAR_PATTERN.findall(line)
                if year_matches:
                    year = year_matches[-1]  # Use the last year found (likely graduation)
                    year = line[line.rfind(year):line.rfind(year) + 4]
                elif i + 1 < len(lines):
                    # Check next line for year
                    next_year_matches = YEAR_PATTERN.findall(lines[i + 1])
                    if next_year_matches:
                        year = next_year_matches[-1]
                        year = lines[i + 1][lines[i + 1].rfind(year):lines[i + 1].rfind(year) + 4]

                # Extract field from context around the degree keyword
                field = ""
                field_match = re.search(r"(?:in|of)\s+([A-Za-z\s]+?)(?:\s*[,\.\-\n]|\s*\d|$)", line, re.IGNORECASE)
                if field_match:
                    field = field_match.group(1).strip()
                    # Limit field length to avoid capturing too much
                    if len(field.split()) > 5:
                        field = " ".join(field.split()[:5])

                education.append({
                    "institution": line.strip(),
                    "degree": degree,
                    "field": field,
                    "year": year,
                })
        return education[:5]

    def extract_experience(self, text: str) -> list[dict]:
        """Fix 11: Improved experience extraction with title, duration, and description."""
        experience = []
        if nlp:
            doc = nlp(text[:5000])
            lines = text.split("\n")
            for ent in doc.ents:
                if ent.label_ == "ORG":
                    company = ent.text
                    # Find the line containing this org
                    title = ""
                    duration = ""
                    description = ""

                    for idx, line in enumerate(lines):
                        if company in line:
                            # Look for job title patterns in nearby lines (before and after)
                            search_range = lines[max(0, idx - 2):min(len(lines), idx + 3)]
                            for nearby_line in search_range:
                                for jt in JOB_TITLE_PATTERNS:
                                    if jt.lower() in nearby_line.lower():
                                        title = jt
                                        break
                                if title:
                                    break

                            # Look for date ranges near the org mention
                            for nearby_line in search_range:
                                date_match = DATE_RANGE_PATTERN.search(nearby_line)
                                if date_match:
                                    duration = date_match.group(0)
                                    break

                            # Extract description from the next line(s) after the org mention
                            if idx + 1 < len(lines):
                                desc_line = lines[idx + 1].strip()
                                if desc_line and len(desc_line) > 10 and not YEAR_PATTERN.match(desc_line):
                                    description = desc_line[:200]
                            break

                    experience.append({
                        "company": company,
                        "title": title,
                        "duration": duration,
                        "description": description,
                    })
        return experience[:10]

    def extract_certifications(self, text: str) -> list[str]:
        """Fix 12: Extract certifications from resume text."""
        found = []
        for cert_keyword in CERTIFICATION_KEYWORDS:
            if cert_keyword.lower() in text.lower():
                if cert_keyword not in found:
                    found.append(cert_keyword)
        return found

    def extract_structured_data(self, raw_text: str) -> dict:
        return {
            "name": self.extract_name(raw_text),
            "email": self.extract_email(raw_text),
            "phone": self.extract_phone(raw_text),
            "education": self.extract_education(raw_text),
            "experience": self.extract_experience(raw_text),
            "skills": self.extract_skills(raw_text),
            "certifications": self.extract_certifications(raw_text),
        }

    def get_capabilities(self) -> dict:
        """Fix 7: Report which parsers are available."""
        return {
            "pdf": pdf_extract_text is not None,
            "docx": docx is not None,
            "spacy_ner": nlp is not None,
        }


resume_parser = ResumeParser()
