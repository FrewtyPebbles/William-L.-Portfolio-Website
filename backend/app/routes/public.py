from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from ..database import get_db
from .. import models

router = APIRouter()


@router.get("/projects")
def list_projects(db: Session = Depends(get_db)):
    return db.query(models.Project).all()


@router.get("/projects/{slug}")
def get_project(slug: str, db: Session = Depends(get_db)):
    project = (
        db.query(models.Project)
        .options(
            joinedload(models.Project.images),
            joinedload(models.Project.links),
            joinedload(models.Project.project_sub_pages),
            joinedload(models.Project.contributions).joinedload(models.Contribution.contributor),
        )
        .filter(models.Project.slug == slug)
        .first()
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.get("/resumes")
def list_resumes(db: Session = Depends(get_db)):
    return db.query(models.Resume).all()
