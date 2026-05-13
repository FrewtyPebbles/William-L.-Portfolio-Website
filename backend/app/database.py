import time
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import NullPool
from sqlalchemy.exc import OperationalError
from .settings import settings

IS_DEV = not settings.AURORA_CLUSTER_ARN or not settings.AURORA_SECRET_ARN

if IS_DEV:
    import pathlib
    _db_dir = pathlib.Path(__file__).resolve().parent.parent / ".dev_data"
    _db_dir.mkdir(parents=True, exist_ok=True)
    DATABASE_URL = f"sqlite:///{_db_dir / 'dev.db'}"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    DATABASE_URL = f"postgresql+auroradataapi://:@/{settings.DB_NAME}"
    engine = create_engine(
        DATABASE_URL,
        poolclass=NullPool,
        connect_args=dict(
            aurora_cluster_arn=settings.AURORA_CLUSTER_ARN,
            secret_arn=settings.AURORA_SECRET_ARN,
        ),
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

MAX_DB_RETRIES = 5
DB_RETRY_BASE_DELAY = 1


def init_db():
    """Create all tables. No-op in prod (managed by RDS/Aurora)."""
    if IS_DEV:
        Base.metadata.create_all(bind=engine)


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
