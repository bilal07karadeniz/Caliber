from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.skill_gap_analyzer import skill_gap_analyzer

router = APIRouter()


@router.post("/skill-gap/analyze")
async def analyze_skill_gap(request: dict, db: AsyncSession = Depends(get_db)):
    result = await skill_gap_analyzer.analyze_gap(db, request["user_id"], request["job_id"])
    return result


@router.post("/skill-gap/career-insights")
async def career_insights(request: dict, db: AsyncSession = Depends(get_db)):
    result = await skill_gap_analyzer.get_career_insights(db, request["user_id"])
    return result


@router.get("/skill-gap/learning-path/{user_id}")
async def learning_path(user_id: str, db: AsyncSession = Depends(get_db)):
    result = await skill_gap_analyzer.get_learning_path(db, user_id)
    return result
