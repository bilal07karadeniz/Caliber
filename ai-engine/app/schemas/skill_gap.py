from pydantic import BaseModel
from typing import Optional


class SkillGap(BaseModel):
    skill_name: str
    required_level: int
    user_level: int
    gap: int
    severity: str  # critical, moderate, minor


class CourseRecommendation(BaseModel):
    skill_name: str
    resource_title: str
    resource_type: str  # course, certification, tutorial
    provider: str
    estimated_duration: str
    url: str
    priority: str


class SkillGapReport(BaseModel):
    user_id: str
    job_id: str
    gaps: list[SkillGap]
    recommendations: list[CourseRecommendation]
    overall_readiness: float


class CareerInsight(BaseModel):
    user_id: str
    strongest_areas: list[str]
    recommended_paths: list[str]
    next_skills: list[str]
    summary: str


class LearningPath(BaseModel):
    user_id: str
    courses: list[CourseRecommendation]
    estimated_total_hours: str
