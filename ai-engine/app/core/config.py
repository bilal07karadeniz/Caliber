from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:postgres@postgres:5432/caliber"
    ASYNC_DATABASE_URL: str = ""
    SPACY_MODEL: str = "en_core_web_sm"
    MODEL_PATH: str = "./models"
    UPLOADS_DIR: str = "/tmp"
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3001"
    API_KEY: str = ""

    class Config:
        env_file = ".env"

    def get_async_database_url(self) -> str:
        """Derive async URL from DATABASE_URL if ASYNC_DATABASE_URL is not set."""
        if self.ASYNC_DATABASE_URL:
            return self.ASYNC_DATABASE_URL
        return self.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)


settings = Settings()
