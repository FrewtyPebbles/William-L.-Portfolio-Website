from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file="..\\.env",
        extra="ignore",
    )

    DB_NAME: str = "portfoliodb"
    AURORA_CLUSTER_ARN: str = ""
    AURORA_SECRET_ARN: str = ""

    COGNITO_USER_POOL_ID: str = ""
    COGNITO_CLIENT_ID: str = ""

    S3_BUCKET_NAME: str = ""
    S3_REGION: str = "us-west-1"


settings = Settings()
