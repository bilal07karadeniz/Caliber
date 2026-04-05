from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import resume, matching, skill_gap, admin
from app.core.config import settings
from app.ml.embeddings import embedding_service
from app.services.resume_parser import resume_parser


app = FastAPI(
    title="Caliber Engine",
    description="Caliber - AI-powered job matching and resume parsing service",
    version="1.0.0",
)

# Fix 1: CORS from env variable instead of wildcard
cors_origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Fix 3: API key auth dependency
async def verify_api_key(request: Request):
    if not settings.API_KEY:
        return  # Skip verification in dev when no key is configured
    api_key = request.headers.get("X-API-Key")
    if api_key != settings.API_KEY:
        raise HTTPException(status_code=401, detail="Invalid or missing API key")


app.include_router(resume.router, prefix="/api", tags=["Resume"], dependencies=[Depends(verify_api_key)])
app.include_router(matching.router, prefix="/api", tags=["Matching"], dependencies=[Depends(verify_api_key)])
app.include_router(skill_gap.router, prefix="/api", tags=["Skill Gap"], dependencies=[Depends(verify_api_key)])
app.include_router(admin.router, prefix="/api", tags=["Admin"], dependencies=[Depends(verify_api_key)])


@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "ml_model_available": embedding_service.is_available,
        "resume_parser_capabilities": resume_parser.get_capabilities(),
    }
