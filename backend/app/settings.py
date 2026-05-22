from typing import Any

from pydantic_settings import BaseSettings, SettingsConfigDict
import json

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
    
    GOOGLE_CLIENT_SECRETS_PATH: str = "..\\google_client.secret.json"
    GOOGLE_CLIENT_REDIRECT_URI: str = "https://walofcode.com/api/auth/callback"
    GOOGLE_CLIENT_ID: str = "dev"
    GOOGLE_CLIENT_SECRET: str = "dev"
    SESSION_SECRET: str = "dev"
    GOOGLE_ALGORITHM: str = "HS256"

    __GOOGLE_CLIENT_SECRETS: dict[str, Any] | None = None

    @property
    def GOOGLE_CLIENT_SECRETS(self):
        if not self.__GOOGLE_CLIENT_SECRETS:
            with open(self.GOOGLE_CLIENT_SECRETS_PATH) as fp:
                self.__GOOGLE_CLIENT_SECRETS = json.load(fp)
        return self.__GOOGLE_CLIENT_SECRETS


    ENVIRONMENT:str = "dev"



settings = Settings()
