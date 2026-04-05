from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:postgres@postgres:5432/caliber"
    ASYNC_DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@postgres:5432/caliber"
    SPACY_MODEL: str = "en_core_web_sm"
    MODEL_PATH: str = "./models"
    UPLOADS_DIR: str = "/app/uploads"
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3001"
    API_KEY: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
