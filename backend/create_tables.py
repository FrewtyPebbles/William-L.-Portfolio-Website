import os
from sqlalchemy import create_engine
from app.database import Base
from app import models

DATABASE_URL = "postgresql+auroradataapi://:@/portfoliodb"

engine = create_engine(
    DATABASE_URL,
    connect_args=dict(
        aurora_cluster_arn="arn:aws:rds:us-west-1:139826822924:cluster:portfolio-db",
        secret_arn="arn:aws:secretsmanager:us-west-1:139826822924:secret:portfolio-db-credentials-Q31H4q",
    ),
    echo=True
)

Base.metadata.create_all(bind=engine)
print("Done!")
