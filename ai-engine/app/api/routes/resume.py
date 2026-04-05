import os
import tempfile
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.resume import ResumeParseResponse, ParsedResumeData
from app.services.resume_parser import resume_parser

router = APIRouter()


@router.post("/parse-resume", response_model=ResumeParseResponse)
async def parse_resume(file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    # Save uploaded file to temp directory
    suffix = os.path.splitext(file.filename or ".pdf")[1]
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        raw_text = resume_parser.parse_file(tmp_path)
        structured = resume_parser.extract_structured_data(raw_text)

        return ResumeParseResponse(
            extracted_text=raw_text[:50000],
            parsed_data=ParsedResumeData(**structured),
        )
    finally:
        # Clean up temp file
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)
