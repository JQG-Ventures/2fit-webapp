from pydantic import BaseModel, field_validator


class LoginRequest(BaseModel):
    email: str | None = None
    phone: str | None = None
    password: str

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, value: str | None) -> str | None:
        if value is None:
            return None

        normalized = value.strip().lower()
        return normalized or None

    @field_validator("phone", mode="before")
    @classmethod
    def normalize_phone(cls, value: str | None) -> str | None:
        if value is None:
            return None

        normalized = value.strip()
        return normalized or None


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
