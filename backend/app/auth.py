import os

import boto3
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session
from app import models
from app.database import SessionLocal, get_db
from app.settings import settings
from google.auth.transport import requests
from google.oauth2 import id_token

_IS_DEV = not settings.COGNITO_USER_POOL_ID or not settings.COGNITO_CLIENT_ID

if not _IS_DEV:
    cognito = boto3.client("cognito-idp")


def admin_login(username: str, password: str) -> dict:
    if _IS_DEV:
        return {
            "AccessToken": "dev-token",
            "ExpiresIn": 86400,
            "TokenType": "Bearer",
        }

    response = cognito.admin_initiate_auth(
        UserPoolId=settings.COGNITO_USER_POOL_ID,
        ClientId=settings.COGNITO_CLIENT_ID,
        AuthFlow="ADMIN_USER_PASSWORD_AUTH",
        AuthParameters={
            "USERNAME": username,
            "PASSWORD": password,
        },
    )

    if "ChallengeName" in response and response["ChallengeName"] == "NEW_PASSWORD_REQUIRED":
        challenge_response = cognito.admin_respond_to_auth_challenge(
            UserPoolId=settings.COGNITO_USER_POOL_ID,
            ClientId=settings.COGNITO_CLIENT_ID,
            ChallengeName="NEW_PASSWORD_REQUIRED",
            ChallengeResponses={
                "USERNAME": username,
                "PASSWORD": password,
            },
            Session=response["Session"],
        )
        return challenge_response["AuthenticationResult"]

    return response["AuthenticationResult"]

# Comments system
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1' if settings.ENVIRONMENT == "dev" else '0'
os.environ['OAUTHLIB_RELAX_TOKEN_SCOPE'] = '1'

GOOGLE_SCOPES = [
    "openid",
    "email", 
    "profile", 
]

SECURITY_SCHEME = HTTPBearer()

def get_current_user(
        request: Request,
        db: Session = Depends(get_db)
    ) -> models.User:
    """
    Gets user from user_id.
    """

    user_id = request.session.get("user_id")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )

    user = db.query(models.User).filter(
        models.User.id == user_id
    ).first()

    if not user:
        request.session.clear()

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid session"
        )

    return user
