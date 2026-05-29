import json
import io
from fastapi import APIRouter, Depends, HTTPException, Response, UploadFile, Form, status
from pydantic import BaseModel
from sqlalchemy.orm import Session, joinedload
from typing import Optional
from app.auth import admin_login, get_admin

router = APIRouter()


def required(msg: str):
    raise HTTPException(status_code=400, detail=msg)

# --- LOGIN ---

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login")
def login(body: LoginRequest, response: Response):
    try:
        result = admin_login(body.username, body.password)
        
        access_token = result["AccessToken"]
        expires_in = result["ExpiresIn"]

        response.set_cookie(
            key="admin_access_token",
            value=access_token,
            httponly=True,
            secure=True,
            samesite="lax",
            max_age=expires_in,
            path="/",
        )

        return {
            "status": "success",
            "message": "Authentication successful"
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid credentials"
        )
    
@router.get("/check")
def check_auth_status(admin_user: dict = Depends(get_admin)):
    return {"authenticated": True}


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("admin_access_token")
    return {"ok": True}