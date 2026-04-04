from pydantic import BaseModel
from typing import Optional


class ResumeParseRequest(BaseModel):
    file_path: str


class Education(BaseModel):
    institution: str = ""
    degree: str = ""
    field: str = ""
    year: str = ""


class Experience(BaseModel):
    company: str = ""
    title: str = ""
    duration: str = ""
    description: str = ""


class ParsedResumeData(BaseModel):
    name: str = ""
    email: str = ""
    phone: str = ""
    education: list[Education] = []
    experience: list[Experience] = []
    skills: list[str] = []
    certifications: list[str] = []


class ResumeParseResponse(BaseModel):
    extracted_text: str
    parsed_data: ParsedResumeData
