import os
import time
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import NullPool
from sqlalchemy.exc import OperationalError

DB_NAME = os.environ.get("DB_NAME", "portfoliodb")
AURORA_CLUSTER_ARN = os.environ.get("AURORA_CLUSTER_ARN", "")
AURORA_SECRET_ARN = os.environ.get("AURORA_SECRET_ARN", "")

DATABASE_URL = f"postgresql+auroradataapi://:@/{DB_NAME}"

engine = create_engine(
    DATABASE_URL,
    poolclass=NullPool,
    connect_args=dict(
        aurora_cluster_arn=AURORA_CLUSTER_ARN,
        secret_arn=AURORA_SECRET_ARN,
    ),
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

MAX_DB_RETRIES = 5
DB_RETRY_BASE_DELAY = 1


def get_db():
    last_error = None
    for attempt in range(MAX_DB_RETRIES):
        try:
            db = SessionLocal()
            db.execute(text("SELECT 1"))
        except OperationalError as e:
            last_error = e
            if db:
                db.close()
            if attempt < MAX_DB_RETRIES - 1:
                time.sleep(DB_RETRY_BASE_DELAY * (2**attempt))
            continue
        try:
            yield db
        finally:
            db.close()
        return
    raise last_error
