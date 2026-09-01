import os
from datetime import datetime
from sqlalchemy import text
from app.core.database import engine


def _dir():
    raw = os.getenv("YAZOO_BACKUP_DIR") or r"D:\YazooBackup"
    os.makedirs(raw, exist_ok=True)
    return raw


def run_startup_backup():
    folder = _dir()
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    dest = os.path.join(folder, f"YazooLab_{stamp}.bak")
    db = os.getenv("YAZOO_DB_NAME") or os.getenv("DB_NAME") or "YazooLabInventory"
    try:
        with engine.begin() as conn:
            conn.execute(text(f"BACKUP DATABASE [{db}] TO DISK = :p WITH INIT, COPY_ONLY"), {"p": dest})
        print(f"[backup] OK {dest}")
        return dest
    except Exception as e:
        marker = os.path.join(folder, f"backup_skip_{stamp}.txt")
        try:
            with open(marker, "w", encoding="utf-8") as f:
                f.write(str(e))
        except Exception:
            pass
        print(f"[backup] no se pudo hacer BACKUP DATABASE: {e}")
        return None