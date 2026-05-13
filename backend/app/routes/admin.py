import json
import io
from fastapi import APIRouter, Depends, HTTPException, UploadFile, Form
from pydantic import BaseModel
from sqlalchemy.orm import Session, joinedload
from typing import Optional
from ..database import get_db
from .. import models
from ..s3 import s3_upload_file, s3_delete_file, get_asset_s3_url
from ..auth import admin_login

router = APIRouter()


def required(msg: str):
    raise HTTPException(status_code=400, detail=msg)


def _parse_json_items(raw_list: list[str]) -> list[dict]:
    items = []
    for raw in raw_list:
        parsed = json.loads(raw)
        if isinstance(parsed, dict):
            items.append(parsed)
        elif isinstance(parsed, list):
            items.extend(el for el in parsed if isinstance(el, dict))
    return items


# --- LOGIN ---

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login")
def login(body: LoginRequest):
    try:
        result = admin_login(body.username, body.password)
        return {
            "access_token": result["AccessToken"],
            "expires_in": result["ExpiresIn"],
            "token_type": result["TokenType"],
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid credentials")


@router.post("/logout")
def logout():
    return {"ok": True}


# --- PROJECTS ---

@router.get("/projects")
def list_projects(db: Session = Depends(get_db)):
    return db.query(models.Project).options(
        joinedload(models.Project.images),
        joinedload(models.Project.links),
        joinedload(models.Project.project_sub_pages),
        joinedload(models.Project.contributions).joinedload(models.Contribution.contributor),
    ).all()


def _resolve_contributions(contributions_raw: list[str], db: Session):
    resolved = []
    for raw in contributions_raw:
        parsed = json.loads(raw)
        items = parsed if isinstance(parsed, list) else [parsed]
        for c in items:
            if not isinstance(c, dict):
                continue
            level = c.get("level", "EVERYTHING")
            description = c.get("description", "")
            contributor_data = c.get("contributor", {})
            name = contributor_data.get("name", "")
            github = contributor_data.get("githubUserName", "")

            existing = db.query(models.Contributor).filter(
                (models.Contributor.name == name) | (models.Contributor.githubUserName == github)
            ).first()
            if existing:
                contributor_id = existing.id
            else:
                new_contributor = models.Contributor(name=name, githubUserName=github)
                db.add(new_contributor)
                db.flush()
                contributor_id = new_contributor.id

            resolved.append({
                "id": c.get("id", 0),
                "level": level,
                "description": description,
                "contributorId": contributor_id,
            })
    return resolved


@router.post("/projects")
def create_project(
    title: str = Form(...),
    slug: str = Form(...),
    progress: str = Form(...),
    short_description: str = Form(...),
    nav_description: str = Form(...),
    full_description: str = Form(...),
    images: list[str] = Form([]),
    image_files: list[UploadFile] = Form([]),
    links: list[str] = Form([]),
    contributions: list[str] = Form([]),
    db: Session = Depends(get_db),
):
    if not title:
        required("title")
    if not slug:
        required("slug")

    for file in image_files:
        if file.filename:
            content = file.file.read()
            s3_upload_file(get_asset_s3_url(file.filename), content)

    # parse images
    parsed_images = _parse_json_items(images)
    for img in parsed_images:
        if not img.get("src"):
            required("image src")

    # parse links
    parsed_links = _parse_json_items(links)
    for lnk in parsed_links:
        if not lnk.get("title"):
            required("link's title")
        if not lnk.get("link"):
            required("link's link field")

    resolved = _resolve_contributions(contributions, db)

    project = models.Project(
        title=title,
        slug=slug,
        progress=progress,
        short_description=short_description,
        nav_description=nav_description,
        full_description=full_description,
    )

    for img in parsed_images:
        project.images.append(models.ProjectSubImage(
            src=img["src"], title=img.get("title", ""), description=img.get("description", "")
        ))
    for lnk in parsed_links:
        project.links.append(models.ProjectSubLink(
            title=lnk["title"], description=lnk.get("description", ""), link=lnk["link"]
        ))
    for cr in resolved:
        project.contributions.append(models.Contribution(
            level=cr["level"], description=cr["description"], contributorID=cr["contributorId"]
        ))

    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.put("/projects")
def update_project(
    id: int = Form(...),
    title: str = Form(...),
    slug: str = Form(...),
    progress: str = Form(...),
    short_description: str = Form(...),
    nav_description: str = Form(...),
    full_description: str = Form(...),
    images: list[str] = Form([]),
    image_files: list[UploadFile] = Form([]),
    links: list[str] = Form([]),
    contributions: list[str] = Form([]),
    db: Session = Depends(get_db),
):
    project = db.query(models.Project).filter(models.Project.id == id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # parse images
    parsed_images = _parse_json_items(images)
    for img in parsed_images:
        if not img.get("src"):
            required("image src")

    parsed_links = _parse_json_items(links)
    for lnk in parsed_links:
        if not lnk.get("title"):
            required("link's title")
        if not lnk.get("link"):
            required("link's link field")

    resolved = _resolve_contributions(contributions, db)

    project.title = title
    project.slug = slug
    project.progress = progress
    project.short_description = short_description
    project.nav_description = nav_description
    project.full_description = full_description

    # handle image deletions
    old_images = {img.id: img for img in project.images}
    new_image_ids = {img.get("id") for img in parsed_images if img.get("id")}
    for img_id, img in old_images.items():
        if img_id not in new_image_ids:
            s3_delete_file(get_asset_s3_url(img.src))

    # replace images
    db.query(models.ProjectSubImage).filter(
        models.ProjectSubImage.projectID == id
    ).delete()
    for img in parsed_images:
        db.add(models.ProjectSubImage(
            src=img["src"], title=img.get("title", ""), description=img.get("description", ""),
            projectID=id
        ))

    # replace links
    db.query(models.ProjectSubLink).filter(
        models.ProjectSubLink.projectID == id
    ).delete()
    for lnk in parsed_links:
        db.add(models.ProjectSubLink(
            title=lnk["title"], description=lnk.get("description", ""), link=lnk["link"],
            projectID=id
        ))

    # replace contributions
    db.query(models.Contribution).filter(
        models.Contribution.projectID == id
    ).delete()
    for cr in resolved:
        db.add(models.Contribution(
            level=cr["level"], description=cr["description"],
            contributorID=cr["contributorId"], projectID=id
        ))

    # upload new files
    for file in image_files:
        if file.filename:
            content = file.file.read()
            s3_upload_file(get_asset_s3_url(file.filename), content)

    db.commit()
    db.refresh(project)
    return project


@router.delete("/projects")
def delete_project(data: dict, db: Session = Depends(get_db)):
    pid = data.get("id")
    project = db.query(models.Project).filter(models.Project.id == pid).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    for img in project.images:
        s3_delete_file(get_asset_s3_url(img.src))

    db.delete(project)
    db.commit()
    return {"ok": True}


# --- RESUMES ---

@router.get("/resumes")
def list_resumes(db: Session = Depends(get_db)):
    return db.query(models.Resume).all()


def _handle_file_upload(file: Optional[UploadFile]) -> tuple[bool, str]:
    """Handle file upload to S3. Returns (had_file, src)"""
    if file and file.filename:
        content = file.file.read()
        s3_upload_file(get_asset_s3_url(file.filename), content)
        return True, file.filename
    return False, ""


@router.post("/resumes")
def create_resume(
    title: str = Form(...),
    nav_description: str = Form(...),
    src: str = Form(...),
    file: UploadFile = Form(None),
    db: Session = Depends(get_db),
):
    if not title:
        required("title")
    if not nav_description:
        required("nav_description")
    if not src:
        required("src")

    _handle_file_upload(file)

    resume = models.Resume(title=title, nav_description=nav_description, src=src)
    db.add(resume)
    db.commit()
    db.refresh(resume)
    return resume


@router.put("/resumes")
def update_resume(
    id: int = Form(...),
    title: str = Form(...),
    nav_description: str = Form(...),
    src: str = Form(...),
    file: UploadFile = Form(None),
    db: Session = Depends(get_db),
):
    resume = db.query(models.Resume).filter(models.Resume.id == id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    had_file, _ = _handle_file_upload(file)
    if had_file and resume.src:
        s3_delete_file(get_asset_s3_url(resume.src))

    resume.title = title
    resume.nav_description = nav_description
    resume.src = src
    db.commit()
    db.refresh(resume)
    return resume


@router.delete("/resumes")
def delete_resume(data: dict, db: Session = Depends(get_db)):
    rid = data.get("id")
    resume = db.query(models.Resume).filter(models.Resume.id == rid).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    s3_delete_file(get_asset_s3_url(resume.src))
    db.delete(resume)
    db.commit()
    return {"ok": True}


# --- PUBLIC FILES ---

@router.get("/public_files")
def list_public_files(db: Session = Depends(get_db)):
    return db.query(models.PublicFile).all()


@router.post("/public_files")
def create_public_file(
    title: str = Form(...),
    tool_tip: str = Form(...),
    src: str = Form(...),
    file: UploadFile = Form(None),
    db: Session = Depends(get_db),
):
    if not title:
        required("title")
    if not tool_tip:
        required("tool_tip")
    if not src:
        required("src")

    _handle_file_upload(file)

    pf = models.PublicFile(title=title, tool_tip=tool_tip, src=src)
    db.add(pf)
    db.commit()
    db.refresh(pf)
    return pf


@router.put("/public_files")
def update_public_file(
    id: int = Form(...),
    title: str = Form(...),
    tool_tip: str = Form(...),
    src: str = Form(...),
    file: UploadFile = Form(None),
    db: Session = Depends(get_db),
):
    pf = db.query(models.PublicFile).filter(models.PublicFile.id == id).first()
    if not pf:
        raise HTTPException(status_code=404, detail="Public file not found")

    had_file, _ = _handle_file_upload(file)
    if had_file and pf.src:
        s3_delete_file(get_asset_s3_url(pf.src))

    pf.title = title
    pf.tool_tip = tool_tip
    pf.src = src
    db.commit()
    db.refresh(pf)
    return pf


@router.delete("/public_files")
def delete_public_file(data: dict, db: Session = Depends(get_db)):
    pid = data.get("id")
    pf = db.query(models.PublicFile).filter(models.PublicFile.id == pid).first()
    if not pf:
        raise HTTPException(status_code=404, detail="Public file not found")

    s3_delete_file(get_asset_s3_url(pf.src))
    db.delete(pf)
    db.commit()
    return {"ok": True}
