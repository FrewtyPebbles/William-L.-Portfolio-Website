import boto3
from .settings import settings

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
