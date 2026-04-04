from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.resume import ResumeParseRequest, ResumeParseResponse, ParsedResumeData
from app.services.resume_parser import resume_parser

router = APIRouter()


@router.post("/parse-resume", response_model=ResumeParseResponse)
async def parse_resume(request: ResumeParseRequest, db: AsyncSession = Depends(get_db)):
    raw_text = resume_parser.parse_file(request.file_path)
    structured = resume_parser.extract_structured_data(raw_text)

    return ResumeParseResponse(
        extracted_text=raw_text[:50000],
        parsed_data=ParsedResumeData(**structured),
    )
