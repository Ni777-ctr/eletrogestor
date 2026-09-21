"""Configuracoes da aplicacao, lidas de variaveis de ambiente (.env)."""
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    DATABASE_URL: str = "postgresql+psycopg2://eletrogestor:eletrogestor@localhost:5432/eletrogestor"
    ENVIRONMENT: str = "development"
    JWT_SECRET_KEY: str = "troque-esta-chave-antes-de-ir-para-producao"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480
    REFRESH_TOKEN_EXPIRE_DIAS: int = 7
    MAX_TENTATIVAS_LOGIN: int = 5
    BLOQUEIO_MINUTOS: int = 30
    CONVITE_EXPIRA_HORAS: int = 72
    MFA_TOKEN_EXPIRE_MINUTOS: int = 5
    CORS_ORIGINS: str = "http://localhost:8081,http://localhost:5173,http://localhost:3000"

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    def validar_seguranca_producao(self) -> None:
        if self.ENVIRONMENT.lower() == "production" and self.JWT_SECRET_KEY == "troque-esta-chave-antes-de-ir-para-producao":
            raise ValueError("JWT_SECRET_KEY deve ser configurada em producao.")


@lru_cache
def get_settings() -> Settings:
    return Settings()
