from sqlalchemy import Column, String, Boolean, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(String, primary_key=True)
    userId = Column("userId", String, nullable=False)
    filePath = Column("filePath", String, nullable=False)
    fileName = Column("fileName", String, nullable=False)
    extractedText = Column("extractedText", String, nullable=True)
    parsedData = Column("parsedData", JSON, nullable=True)
    isActive = Column("isActive", Boolean, default=True)
    uploadedAt = Column("uploadedAt", DateTime, server_default=func.now())

    user = relationship("User", back_populates="resumes", foreign_keys=[userId],
                        primaryjoin="Resume.userId == User.id")
