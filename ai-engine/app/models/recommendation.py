from sqlalchemy import Column, String, Float, DateTime, JSON
from sqlalchemy.sql import func
from app.core.database import Base


class AiRecommendation(Base):
    __tablename__ = "ai_recommendations"

    id = Column(String, primary_key=True)
    userId = Column("userId", String, nullable=False)
    jobId = Column("jobId", String, nullable=False)
    matchScore = Column("matchScore", Float, nullable=False)
    skillGap = Column("skillGap", JSON, nullable=True)
    explanation = Column(String, nullable=True)
    createdAt = Column("createdAt", DateTime, server_default=func.now())
