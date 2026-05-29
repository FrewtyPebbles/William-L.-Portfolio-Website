import os

import boto3
from fastapi import Cookie, Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session
from app import models
from app.database import SessionLocal, get_db
from app.settings import settings
from google.auth.transport import requests
from google.oauth2 import id_token
from botocore.exceptions import ClientError

_IS_DEV = not settings.COGNITO_USER_POOL_ID or not settings.COGNITO_CLIENT_ID

if not _IS_DEV:
    cognito = boto3.client("cognito-idp")

SECURITY_SCHEME = HTTPBearer()

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

async def get_admin(admin_access_token: str = Cookie(None)) -> dict:
    """
    Gets user from user_id.
    """
    if not admin_access_token:
        raise HTTPException(status_code=401, detail="Missing admin token")

    access_token = admin_access_token

    if _IS_DEV:
        if access_token == "dev-token":
            # Return a mock dictionary that matches Cognito's get_user output structure
            return {
                "Username": "dev-admin-user",
                "UserAttributes": [
                    {"Name": "sub", "Value": "00000000-0000-0000-0000-000000000000"},
                    {"Name": "email", "Value": "dev-admin@example.com"}
                ],
                "Enabled": True,
                "UserStatus": "CONFIRMED"
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid dev token",
            )

    try:
        user_info = cognito.get_user(AccessToken=access_token)
        return user_info
    except ClientError as e:
        error_code = e.response["Error"]["Code"]
        if error_code in ["NotAuthorizedException", "UserNotFoundException"]:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid, expired, or revoked admin token",
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Admin authentication service error",
        )


# Comments system
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1' if settings.ENVIRONMENT == "dev" else '0'
os.environ['OAUTHLIB_RELAX_TOKEN_SCOPE'] = '1'

GOOGLE_SCOPES = [
    "openid",
    "email", 
    "profile", 
]

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
