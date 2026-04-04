from pydantic import BaseModel
from typing import Optional


class MatchRequest(BaseModel):
    user_id: str
    job_id: str


class BulkMatchRequest(BaseModel):
    user_id: Optional[str] = None
    job_id: Optional[str] = None
    limit: int = 20


class SkillGapItem(BaseModel):
    skill_name: str
    required_level: int
    user_level: int
    gap: int


class MatchBreakdown(BaseModel):
    skill_match: float = 0.0
    experience_relevance: float = 0.0
    education_match: float = 0.0
    location_match: float = 0.0
    salary_fit: float = 0.0


class MatchResult(BaseModel):
    user_id: str
    job_id: str
    score: float
    breakdown: MatchBreakdown = MatchBreakdown()
    skill_gaps: list[SkillGapItem] = []
    explanation: str = ""


class MatchResponse(BaseModel):
    matches: list[MatchResult]
