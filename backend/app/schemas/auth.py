from __future__ import annotations

from typing import Optional

from pydantic import BaseModel


class LoginRequest(BaseModel):
    email: Optional[str] = None
    phone: Optional[str] = None
    password: str


class GoogleAuthRequest(BaseModel):
    email: str
    name: str


class GoogleLoginRequest(BaseModel):
    id_token: str


class PlayerIDRequest(BaseModel):
    player_id: str
    platform: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    expires_at: int
    refresh_token: Optional[str] = None
    user_id: Optional[str] = None
    name: Optional[str] = None
