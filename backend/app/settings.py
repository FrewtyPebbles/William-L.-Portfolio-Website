from typing import Any

import boto3
from botocore.exceptions import ClientError
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
    SESSION_SECRET: str = "dev"
    GOOGLE_ALGORITHM: str = "HS256"

    GOOGLE_CLOUD_SECRET_ARN:str = None

    __GOOGLE_CLIENT_SECRETS: dict[str, Any] | None = None

    @property
    def GOOGLE_CLIENT_SECRETS(self):
        if self.ENVIRONMENT == "dev":
            if not self.__GOOGLE_CLIENT_SECRETS:
                with open(self.GOOGLE_CLIENT_SECRETS_PATH) as fp:
                    self.__GOOGLE_CLIENT_SECRETS = json.load(fp)
            return self.__GOOGLE_CLIENT_SECRETS
        else:
            if not self.__GOOGLE_CLIENT_SECRETS:
                if self.GOOGLE_CLOUD_SECRET_ARN:
                    client = boto3.client("secretsmanager", region_name=self.S3_REGION)

                    try:
                        response = client.get_secret_value(SecretId=self.GOOGLE_CLOUD_SECRET_ARN)

                        if "SecretString" in response:
                            self.__GOOGLE_CLIENT_SECRETS = json.loads(response["SecretString"])
                        else:
                            raise RuntimeError("Secret binary format is not supported by this application")
                    except ClientError as e:
                        print(f"Failed to retrieve AWS Secret: {e}")
                        raise RuntimeError(f"Could not initialize database credentials: {e}")
            return self.__GOOGLE_CLIENT_SECRETS


    ENVIRONMENT:str = "dev"



settings = Settings()