from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import List, Optional

class Settings(BaseSettings):
    # SQL Server
    DB_SERVER: str = "localhost"
    DB_NAME: str = "YazooLabInventory"
    DB_USER: Optional[str] = None
    DB_PASSWORD: Optional[str] = None
    DB_DRIVER: str = "ODBC Driver 17 for SQL Server"
    DB_TRUSTED_CONNECTION: str = "no"   # "yes" para Windows Auth

    # Seguridad
    SECRET_KEY: str = "cambia-esta-clave"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480

    # App
    ENVIRONMENT: str = "development"
    PROJECT_NAME: str = "Yazoo Lab Inventory"
    API_V1_STR: str = "/api/v1"
    API_V1_STR: str = "/api/v1"
    EVIDENCE_ROOT: str = r"C:\YazooData\evidencias"

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3005",
        "http://127.0.0.1:3005",
    ]

    @property
    def DATABASE_URL(self) -> str:
        driver = self.DB_DRIVER.replace(" ", "+")

        if self.DB_TRUSTED_CONNECTION.lower() == "yes":
            # Autenticación de Windows
            return (
                f"mssql+pyodbc://@{self.DB_SERVER}/{self.DB_NAME}"
                f"?driver={driver}&Trusted_Connection=yes&TrustServerCertificate=yes"
            )
        else:
            # Autenticación SQL (usuario + password)
            return (
                f"mssql+pyodbc://{self.DB_USER}:{self.DB_PASSWORD}"
                f"@{self.DB_SERVER}/{self.DB_NAME}"
                f"?driver={driver}&TrustServerCertificate=yes"
            )

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"

@lru_cache()
def get_settings() -> Settings:
    return Settings()