import json
import io
from fastapi import APIRouter, Depends, HTTPException, UploadFile, Form
from pydantic import BaseModel
from sqlalchemy.orm import Session, joinedload
from typing import Optional
from backend.app.auth import admin_login

router = APIRouter()


def required(msg: str):
    raise HTTPException(status_code=400, detail=msg)

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