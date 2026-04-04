from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.matching_engine import matching_engine
from app.schemas.matching import MatchRequest, BulkMatchRequest

router = APIRouter()


@router.post("/match/user-to-jobs")
async def match_user_to_jobs(request: BulkMatchRequest, db: AsyncSession = Depends(get_db)):
    matches = await matching_engine.match_user_to_jobs(db, request.user_id, request.limit)
    return {"matches": matches}


@router.post("/match/job-to-candidates")
async def match_job_to_candidates(request: BulkMatchRequest, db: AsyncSession = Depends(get_db)):
    matches = await matching_engine.match_job_to_candidates(db, request.job_id, request.limit)
    return {"matches": matches}


@router.post("/match/score")
async def get_match_score(request: MatchRequest, db: AsyncSession = Depends(get_db)):
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
