from typing import Optional

from fastapi import APIRouter, Depends, Form, HTTPException, Request
from sqlalchemy.orm import Session, joinedload
from backend.app.auth import get_current_user
from backend.app.database import SessionLocal, get_db
from backend.app import models

router = APIRouter()

@router.post("/{project_slug}/comments")
async def create_comment(
    project_slug: str,
    request: Request,
    content: str = Form(...),
    parent_id: Optional[int] = Form(None)
):
    user = get_current_user(request)

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

@router.get("/{project_slug}/comments")
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