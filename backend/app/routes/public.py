import platform

from fastapi import APIRouter, Depends, Form, HTTPException, Request, Response, status
from fastapi.responses import RedirectResponse
from sqlalchemy import delete
from sqlalchemy.orm import Session
from app.auth import GOOGLE_SCOPES, get_admin, get_current_user
from app.database import SessionLocal, get_db
from app import models
from app.settings import settings
import requests
from google_auth_oauthlib.flow import Flow
from pydantic import BaseModel, field_validator
import secrets
import hashlib
import base64
import os

CURRENT_OS = platform.system()

router = APIRouter()

class CreateCommentSchema(BaseModel):
    parent_id:int | None = None
    content:str

    @field_validator('content')
    @classmethod
    def validate_content(cls, content: str) -> str:
        content = content.strip()
        if content == "":
            raise ValueError("Comment cannot be empty.")
        return content

@router.post("/project/{project_slug}/comments")
async def create_comment(
    request: Request,
    project_slug: str,
    new_comment: CreateCommentSchema,
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # validate that parent exists to prevent orphan comments
    if new_comment.parent_id:
        parent = db.query(models.Comment).filter(
            models.Comment.id == new_comment.parent_id,
            models.Comment.project_slug == project_slug
        ).first()

        if not parent:
            return {"error": "Parent comment not found"}

    comment = models.Comment(
        content=new_comment.content,
        user_id=user.id,
        project_slug=project_slug,
        parent_id=new_comment.parent_id
    )

    db.add(comment)
    db.commit()
    db.refresh(comment)

    return {
        "id": comment.id,
        "content": comment.content
    }
    
def recurse_comments(comments: list[models.Comment]):
    ret_comments = []
    for c in comments:
        comment_replies = c.replies
        date = ""
        if CURRENT_OS == "Windows":
            created_at = c.created_at.strftime("%#m/%#d/%Y at %#I:%M:%S %p")
        else:
            created_at = c.created_at.strftime("%-m/%-d/%Y at %-I:%M:%S %p")
        ret_comments.append({
            "id": c.id,
            "content": c.content,
            "author": c.user.name,
            "avatar": c.user.avatar_url,
            "created_at": created_at,
            "replies":recurse_comments(comment_replies) if len(comment_replies) else [],
        })
    
    return ret_comments


@router.get("/project/{project_slug}/comments")
def get_comments(project_slug: str, parent_id: int = None, db: Session = Depends(get_db)):
    comments = (
        db.query(models.Comment)
        .filter(
            models.Comment.project_slug == project_slug,
            models.Comment.parent_id.is_(parent_id)
        )
        .all()
    )

    return recurse_comments(comments)

@router.delete("/project/{project_slug}/comments")
def get_comments(project_slug: str, comment_id:int, db: Session = Depends(get_db)):
    try:
        del_statement = (
            delete(models.Comment)
            .where(
                models.Comment.project_slug == project_slug,
                models.Comment.id.is_(comment_id)
            )
        )

        db.execute(del_statement)
        db.commit()

        return {"error":False, "message":f"Deleted comment with id {comment_id}."}
    except Exception as e:
        return {"error":True, "message":f"Deleted comment with id {comment_id}. ({e})"}

@router.get("/login")
async def login_google_sso(request: Request, return_uri:str = "/"):
    if settings.ENVIRONMENT == "prod":
        
        flow = Flow.from_client_config(
            settings.GOOGLE_CLIENT_SECRETS,
            scopes=GOOGLE_SCOPES,
        )

        flow.redirect_uri = settings.GOOGLE_CLIENT_REDIRECT_URI

        # generate the authorization URL and state token
        authorization_url, state = flow.authorization_url(
            access_type='offline', 
            include_granted_scopes='true',
            prompt='select_account'
        )

        # Retrieve the auto-generated PKCE verifier from the flow object
        code_verifier = flow.code_verifier
        
        response = RedirectResponse(url=authorization_url)
        # the google state cookie
        response.set_cookie(
            key="state",
            value=state,
            httponly=True,
            max_age=300,
            samesite="lax", # allows cross site state delivery
            secure=settings.ENVIRONMENT == "prod" # should be secure in prod
        )
        # create anti state forgery cookie with extra security
        # this will be compared with google state cookie to see if it has expired
        response.set_cookie(
            key="oauth_state",
            value=state,
            httponly=True,
            max_age=300, # 5 min
            samesite="lax", # allows cross site state delivery
            secure=settings.ENVIRONMENT == "prod" # should be secure in prod
        )
        # set redirect url
        response.set_cookie(
            key="return_uri",
            value=return_uri,
            httponly=True,
            max_age=300,
            samesite="lax", # allows cross site state delivery
            secure=settings.ENVIRONMENT == "prod" # should be secure in prod
        )
        response.set_cookie(
            key="code_verifier",
            value=code_verifier,
            httponly=True,
            max_age=300,
            samesite="lax",
            secure=settings.ENVIRONMENT == "prod"
        )
        
        return response

    elif settings.ENVIRONMENT == "dev":
        # return debug anon user token.
        with SessionLocal() as db:

            user = db.query(models.User).filter_by(
                google_id=0
            ).first()

            if not user:
                user = models.User(
                    google_id=0,
                    email="ANON@gmail.com",
                    name="ANON",
                    avatar_url="/static/7bbb6f2a-f00e-4005-8a19-17c318c0691b.jpg"
                )

                db.add(user)
                db.commit()
                db.refresh(user)

            request.session.clear()
            request.session["user_id"] = user.id
        return RedirectResponse(url=return_uri)


@router.get("/auth/callback")
async def auth_callback_google_sso(request: Request):
    # retrieve both state copies
    state_from_google = request.query_params.get("state")
    state_from_cookie = request.cookies.get("oauth_state")
    return_uri = request.cookies.get("return_uri")
    code_verifier = request.cookies.get("code_verifier")

    # restrict redirects to local paths only
    if not return_uri or not return_uri.startswith("/"):
        return_uri = "/"

    # validation check with anti-forgery cookie
    if not state_from_cookie or state_from_cookie != state_from_google:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="CSRF Warning: Anti-forgery token state mismatch or expired request."
        )
    if not code_verifier:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Missing PKCE code verifier."
        )

    # explicitly inject the validated state parameter back into the matching verification flow
    flow = Flow.from_client_config(
        settings.GOOGLE_CLIENT_SECRETS,
        scopes=GOOGLE_SCOPES,
    )
    # Inject our saved verifier into the flow object manually before fetch_token
    flow.code_verifier = code_verifier

    if settings.ENVIRONMENT == "prod":
        flow.redirect_uri = settings.GOOGLE_CLIENT_REDIRECT_URI
    else:
        flow.redirect_uri = str(request.url_for("auth_callback_google_sso"))
    
    try:
        if settings.ENVIRONMENT == "prod":
            authorization_response = f"{settings.GOOGLE_CLIENT_REDIRECT_URI}?{request.url.query}"
        else:
            authorization_response = str(request.url)
        
        flow.fetch_token(authorization_response=authorization_response)

        credentials = flow.credentials

        userinfo_response = requests.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={
                "Authorization": f"Bearer {credentials.token}"
            }
        )

        if userinfo_response.status_code != 200:
            raise HTTPException(
                status_code=401,
                detail="Failed to fetch Google user info"
            )

        userinfo = userinfo_response.json()

        google_id = userinfo["id"]
        email = userinfo["email"]
        name = userinfo["name"]
        avatar = userinfo["picture"]

        with SessionLocal() as db:

            user = db.query(models.User).filter_by(
                google_id=google_id
            ).first()

            if not user:
                user = models.User(
                    google_id=google_id,
                    email=email,
                    name=name,
                    avatar_url=avatar
                )

                db.add(user)
                db.commit()
                db.refresh(user)

            request.session.clear()
            request.session["user_id"] = user.id

        response = RedirectResponse(url=return_uri)

        # delete the security cookie since login is completed
        response.delete_cookie("oauth_state")
        response.delete_cookie("state")
        response.delete_cookie("return_uri")
        response.delete_cookie("code_verifier")
        return response
    except Exception as e:
        print(f"Auth error: {str(e)}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))

@router.get("/logout")
def logout(request: Request):
    request.session.clear()

    response = RedirectResponse(url="/")

    return response

@router.get("/me")
async def get_me(
    user: models.User = Depends(get_current_user)
):
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "avatar": user.avatar_url
    }