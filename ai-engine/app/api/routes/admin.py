from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models import AiRecommendation

router = APIRouter()


@router.get("/admin/ai-metrics")
async def get_ai_metrics(db: AsyncSession = Depends(get_db)):
    total_result = await db.execute(select(func.count(AiRecommendation.id)))
    total = total_result.scalar() or 0

    avg_result = await db.execute(select(func.avg(AiRecommendation.matchScore)))
    avg_score = avg_result.scalar() or 0

    return {
        "totalRecommendations": total,
        "averageMatchScore": round(float(avg_score), 1),
    }
