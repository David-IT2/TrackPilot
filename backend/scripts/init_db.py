"""
Run once to create all tables in MySQL:

    python scripts/init_db.py

Safe to re-run — create_all() only creates tables that don't exist yet.
"""
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.db import Base, engine
from app.models import models  # noqa: F401  (import so models register on Base)

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    print("Tables created (or already existed).")
