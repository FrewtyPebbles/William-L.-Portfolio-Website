from typing import Optional

from fastapi import APIRouter, Depends, Form, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session, joinedload
from backend.app.auth import COMMENT_OAUTH, get_current_commenter
from backend.app.database import SessionLocal, get_db
from backend.app import models

router = APIRouter()

@router.post("/project/{project_slug}/comments")
async def create_comment(
    project_slug: str,
    request: Request,
    content: str = Form(...),
    parent_id: Optional[int] = Form(None)
):
    user = get_current_commenter(request)

    db = SessionLocal()

    # validate that parent exists to prevent orphan comments
    if parent_id:
        parent = db.query(models.Comment).filter(
            models.Comment.id == parent_id,
            models.Comment.project_slug == project_slug
        ).first()

        if not parent:
            return {"error": "Parent comment not found"}

    comment = models.Comment(
        content=content,
        user_id=user.id,
        project_slug=project_slug,
        parent_id=parent_id
    )

    db.add(comment)
    db.commit()
    db.refresh(comment)

    return {
        "id": comment.id,
        "content": comment.content
    }

@router.get("/project/{project_slug}/comments")
def get_comments(project_slug: str):
    db = SessionLocal()

    comments = (
        db.query(models.Comment)
        .filter(models.Comment.project_slug == project_slug)
        .all()
    )

    return [
        {
            "id": c.id,
            "content": c.content,
            "author": c.user.name,
            "avatar": c.user.avatar_url,
            "created_at": c.created_at.isoformat()
        }
        for c in comments
    ]


@router.get("/login")
async def login(request: Request):
    redirect_uri = request.url_for("auth_callback")
    return await COMMENT_OAUTH.google.authorize_redirect(
        request,
        redirect_uri
    )


@router.get("/auth/callback")
async def auth_callback(request: Request):
    token = await COMMENT_OAUTH.google.authorize_access_token(request)

    user_info = token["userinfo"]

    db = SessionLocal()

    user = db.query(models.User).filter_by(
        google_id=user_info["sub"]
    ).first()

    if not user:
        user = models.User(
            google_id=user_info["sub"],
            email=user_info["email"],
            name=user_info["name"],
            avatar_url=user_info["picture"]
        )

        db.add(user)
        db.commit()
        db.refresh(user)

    request.session["user_id"] = user.id

    return RedirectResponse("/")