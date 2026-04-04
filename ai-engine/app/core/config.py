from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/ai_match"
    ASYNC_DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/ai_match"
    SPACY_MODEL: str = "en_core_web_sm"
    MODEL_PATH: str = "./models"

    class Config:
        env_file = ".env"


settings = Settings()
