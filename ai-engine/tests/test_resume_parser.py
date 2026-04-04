from app.services.resume_parser import resume_parser


def test_extract_skills():
    text = "Experienced in Python, JavaScript, React, Docker and Kubernetes"
    skills = resume_parser.extract_skills(text)
    assert "Python" in skills
    assert "JavaScript" in skills
    assert "React" in skills
    assert "Docker" in skills


def test_extract_email():
    text = "Contact: john.doe@example.com for more info"
    email = resume_parser.extract_email(text)
    assert email == "john.doe@example.com"


def test_extract_phone():
    text = "Phone: +1 555-123-4567"
    phone = resume_parser.extract_phone(text)
    assert "555" in phone


def test_extract_structured_data(sample_resume_text):
    data = resume_parser.extract_structured_data(sample_resume_text)
    assert "email" in data
    assert data["email"] == "john.doe@email.com"
    assert len(data["skills"]) > 0
    assert "Python" in data["skills"]
    assert "React" in data["skills"]


def test_extract_education(sample_resume_text):
    education = resume_parser.extract_education(sample_resume_text)
    assert len(education) > 0
