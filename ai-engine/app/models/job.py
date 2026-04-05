from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Job(Base):
    __tablename__ = "jobs"

    id = Column(String, primary_key=True)
    employerId = Column("employerId", String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    requirements = Column(String, nullable=False)
    location = Column(String, nullable=False)
    salaryMin = Column("salaryMin", Integer, nullable=True)
    salaryMax = Column("salaryMax", Integer, nullable=True)
    employmentType = Column("employmentType", String, nullable=False)
    isActive = Column("isActive", Boolean, default=True)
    createdAt = Column("createdAt", DateTime, server_default=func.now())
    updatedAt = Column("updatedAt", DateTime, onupdate=func.now())

    employer = relationship("User", foreign_keys=[employerId])
    job_skills = relationship("JobSkill", back_populates="job")
