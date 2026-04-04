from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import resume, matching, skill_gap, admin

app = FastAPI(
    title="Caliber Engine",
    description="Caliber - AI-powered job matching and resume parsing service",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(resume.router, prefix="/api", tags=["Resume"])
app.include_router(matching.router, prefix="/api", tags=["Matching"])
app.include_router(skill_gap.router, prefix="/api", tags=["Skill Gap"])
app.include_router(admin.router, prefix="/api", tags=["Admin"])


@app.get("/health")
async def health_check():
    return {"status": "ok"}
