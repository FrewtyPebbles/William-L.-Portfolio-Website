import os
import boto3

COGNITO_USER_POOL_ID = os.environ.get("COGNITO_USER_POOL_ID", "")
COGNITO_CLIENT_ID = os.environ.get("COGNITO_CLIENT_ID", "")

cognito = boto3.client("cognito-idp")


def admin_login(username: str, password: str) -> dict:
    response = cognito.admin_initiate_auth(
        UserPoolId=COGNITO_USER_POOL_ID,
        ClientId=COGNITO_CLIENT_ID,
        AuthFlow="ADMIN_USER_PASSWORD_AUTH",
        AuthParameters={
            "USERNAME": username,
            "PASSWORD": password,
        },
    )

    if "ChallengeName" in response and response["ChallengeName"] == "NEW_PASSWORD_REQUIRED":
        challenge_response = cognito.admin_respond_to_auth_challenge(
            UserPoolId=COGNITO_USER_POOL_ID,
            ClientId=COGNITO_CLIENT_ID,
            ChallengeName="NEW_PASSWORD_REQUIRED",
            ChallengeResponses={
                "USERNAME": username,
                "NEW_PASSWORD": password,
            },
            Session=response["Session"],
        )
        return challenge_response["AuthenticationResult"]

    return response["AuthenticationResult"]
