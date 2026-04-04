import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def sample_user_skills():
    return [
        {"name": "Python", "level": 4},
        {"name": "JavaScript", "level": 3},
        {"name": "React", "level": 3},
        {"name": "Docker", "level": 2},
    ]


@pytest.fixture
def sample_job_skills():
    return [
        {"name": "Python", "level": 5},
        {"name": "JavaScript", "level": 4},
        {"name": "Docker", "level": 3},
        {"name": "Kubernetes", "level": 2},
    ]


@pytest.fixture
def sample_resume_text():
    return """
    John Doe
    john.doe@email.com
    +1 555-123-4567

    EDUCATION
    Bachelor of Science in Computer Science
    University of Technology, 2020

    EXPERIENCE
    Software Engineer at TechCorp
    2020 - Present
    Built web applications using Python, React, and Node.js.
    Implemented CI/CD pipelines with Docker and Jenkins.

    SKILLS
    Python, JavaScript, TypeScript, React, Node.js, Docker, PostgreSQL, Git, REST API, Machine Learning
    """
