from sqlalchemy import Column, String, Integer
from sqlalchemy.orm import relationship
from app.core.database import Base


class Skill(Base):
    __tablename__ = "skills"

    id = Column(String, primary_key=True)
    name = Column(String, unique=True, nullable=False)
    category = Column(String, nullable=True)

    user_skills = relationship("UserSkill", back_populates="skill")
    job_skills = relationship("JobSkill", back_populates="skill")


class UserSkill(Base):
    __tablename__ = "user_skills"

    id = Column(String, primary_key=True)
    userId = Column("userId", String, nullable=False)
    skillId = Column("skillId", String, nullable=False)
    proficiencyLevel = Column("proficiencyLevel", Integer, nullable=True)

    user = relationship("User", back_populates="user_skills",
                        foreign_keys=[userId], primaryjoin="UserSkill.userId == User.id")
    skill = relationship("Skill", back_populates="user_skills",
                         foreign_keys=[skillId], primaryjoin="UserSkill.skillId == Skill.id")


class JobSkill(Base):
    __tablename__ = "job_skills"

    id = Column(String, primary_key=True)
    jobId = Column("jobId", String, nullable=False)
    skillId = Column("skillId", String, nullable=False)
    requiredLevel = Column("requiredLevel", Integer, nullable=True)

    job = relationship("Job", back_populates="job_skills",
                       foreign_keys=[jobId], primaryjoin="JobSkill.jobId == Job.id")
    skill = relationship("Skill", back_populates="job_skills",
                         foreign_keys=[skillId], primaryjoin="JobSkill.skillId == Skill.id")
