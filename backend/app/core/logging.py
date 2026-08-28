import sys
from loguru import logger
from app.core.config import get_settings

settings = get_settings()

def setup_logging():
    logger.remove()  # quitar el handler por defecto

    # Consola
    logger.add(
        sys.stdout,
        level="DEBUG" if settings.ENVIRONMENT == "development" else "INFO",
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan> - <level>{message}</level>",
        colorize=True,
    )

    # Archivo rotativo
    logger.add(
        "logs/yazoo_lab_{time:YYYY-MM-DD}.log",
        rotation="00:00",          # nuevo archivo cada día
        retention="30 days",
        compression="zip",
        level="INFO",
        encoding="utf-8",
    )

    return logger