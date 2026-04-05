from fastapi import APIRouter, Depends
from pydantic import BaseModel, field_validator
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.matching_engine import matching_engine


router = APIRouter()


# Fix 17: Proper Pydantic models with validation instead of loose dict types
class UserMatchRequest(BaseModel):
    user_id: str
    limit: int = 20

    @field_validator("user_id")
    @classmethod
    def user_id_must_not_be_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("user_id must not be empty")
        return v


class JobMatchRequest(BaseModel):
    job_id: str
    limit: int = 20

    @field_validator("job_id")
    @classmethod
    def job_id_must_not_be_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("job_id must not be empty")
        return v


class MatchScoreRequest(BaseModel):
    user_id: str
    job_id: str

    @field_validator("user_id", "job_id")
    @classmethod
    def ids_must_not_be_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("id must not be empty")
        return v


@router.post("/match/user-to-jobs")
async def match_user_to_jobs(request: UserMatchRequest, db: AsyncSession = Depends(get_db)):
    matches = await matching_engine.match_user_to_jobs(db, request.user_id, request.limit)
    return {"matches": matches}


@router.post("/match/job-to-candidates")
async def match_job_to_candidates(request: JobMatchRequest, db: AsyncSession = Depends(get_db)):
    matches = await matching_engine.match_job_to_candidates(db, request.job_id, request.limit)
    return {"matches": matches}


@router.post("/match/score")
async def get_match_score(request: MatchScoreRequest, db: AsyncSession = Depends(get_db)):
    result = await matching_engine.compute_match_score(db, request.user_id, request.job_id)
    return result


@router.get("/recommendations/{user_id}")
async def get_recommendations(user_id: str, db: AsyncSession = Depends(get_db)):
    from sqlalchemy import select
    from app.models import AiRecommendation
    result = await db.execute(
        select(AiRecommendation)
        .where(AiRecommendation.userId == user_id)
        .order_by(AiRecommendation.matchScore.desc())
    )
    recs = result.scalars().all()
    return {"recommendations": [{"id": r.id, "jobId": r.jobId, "matchScore": r.matchScore, "explanation": r.explanation, "skillGap": r.skillGap} for r in recs]}
