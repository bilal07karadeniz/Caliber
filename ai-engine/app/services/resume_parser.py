import re
import os
from typing import Optional

try:
    from pdfminer.high_level import extract_text as pdf_extract_text
except ImportError:
    pdf_extract_text = None

try:
    import docx
except ImportError:
    docx = None

try:
    import spacy
    nlp = spacy.load("en_core_web_sm")
except Exception:
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

EMAIL_PATTERN = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")
PHONE_PATTERN = re.compile(r"[\+]?[\d\s\-\(\)]{7,15}")


class ResumeParser:
    def parse_pdf(self, file_path: str) -> str:
        if pdf_extract_text is None:
            return ""
        try:
            return pdf_extract_text(file_path)
        except Exception as e:
            print(f"PDF parse error: {e}")
            return ""

    def parse_docx(self, file_path: str) -> str:
        if docx is None:
            return ""
        try:
            doc = docx.Document(file_path)
            return "\n".join([p.text for p in doc.paragraphs])
        except Exception as e:
            print(f"DOCX parse error: {e}")
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
        text_lower = text.lower()
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
        education = []
        edu_keywords = ["university", "college", "institute", "bachelor", "master", "phd", "degree", "b.sc", "m.sc", "b.a", "m.a", "mba"]
        lines = text.split("\n")
        for i, line in enumerate(lines):
            if any(kw in line.lower() for kw in edu_keywords):
                education.append({
                    "institution": line.strip(),
                    "degree": "",
                    "field": "",
                    "year": "",
                })
        return education[:5]

    def extract_experience(self, text: str) -> list[dict]:
        experience = []
        if nlp:
            doc = nlp(text[:5000])
            for ent in doc.ents:
                if ent.label_ == "ORG":
                    experience.append({
                        "company": ent.text,
                        "title": "",
                        "duration": "",
                        "description": "",
                    })
        return experience[:10]

    def extract_structured_data(self, raw_text: str) -> dict:
        return {
            "name": self.extract_name(raw_text),
            "email": self.extract_email(raw_text),
            "phone": self.extract_phone(raw_text),
            "education": self.extract_education(raw_text),
            "experience": self.extract_experience(raw_text),
            "skills": self.extract_skills(raw_text),
            "certifications": [],
        }


resume_parser = ResumeParser()
