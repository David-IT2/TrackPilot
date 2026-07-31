"""
Central app configuration, loaded from environment variables / .env file.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "mysql+pymysql://tracker_user:tracker_pass@localhost:3306/job_tracker"

    ollama_host: str = "http://localhost:11434"
    ollama_model: str = "llama3.1:8b"

    google_client_secret_file: str = "./client_secret.json"
    gmail_token_file: str = "./token.json"

    sync_interval_minutes: int = 10

    api_token: str = ""


settings = Settings()
