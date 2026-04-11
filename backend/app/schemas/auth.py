from pydantic import BaseModel


class LoginRequest(BaseModel):
    email: str | None = None
    phone: str | None = None
    password: str


class GoogleAuthRequest(BaseModel):
    email: str
    name: str


class GoogleLoginRequest(BaseModel):
    id_token: str


class PlayerIDRequest(BaseModel):
    player_id: str
    platform: str | None = None


class TokenResponse(BaseModel):
    access_token: str
    expires_at: int
    refresh_token: str | None = None
    user_id: str | None = None
    name: str | None = None
