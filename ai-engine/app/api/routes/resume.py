import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.config import settings
from app.schemas.resume import ResumeParseRequest, ResumeParseResponse, ParsedResumeData
from app.services.resume_parser import resume_parser

router = APIRouter()

UPLOADS_DIR = os.path.realpath(settings.UPLOADS_DIR)


@router.post("/parse-resume", response_model=ResumeParseResponse)
async def parse_resume(request: ResumeParseRequest, db: AsyncSession = Depends(get_db)):
    # Fix 2: Path traversal validation
    real_path = os.path.realpath(request.file_path)
    if not real_path.startswith(UPLOADS_DIR):
        raise HTTPException(status_code=400, detail="File path is outside the allowed uploads directory")

    raw_text = resume_parser.parse_file(real_path)
    structured = resume_parser.extract_structured_data(raw_text)

    return ResumeParseResponse(
        extracted_text=raw_text[:50000],
        parsed_data=ParsedResumeData(**structured),
    )
