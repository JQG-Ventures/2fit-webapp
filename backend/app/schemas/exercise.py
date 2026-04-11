from pydantic import BaseModel, Field, field_validator


class ExerciseCreate(BaseModel):
    name: str
    description: str = ""
    category: str
    image_url: str = ""
    video_url: str = ""
    muscle_group: list[str]
    difficulty: str = "beginner"
    equipment: list[str] = []
    instructions: list[str] = []
    contradictions: list[str] = []
    is_active: bool = True

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: str) -> str:
        if v not in ("strength", "yoga", "dance", "cardio"):
            raise ValueError("Invalid category")
        return v

    @field_validator("difficulty")
    @classmethod
    def validate_difficulty(cls, v: str) -> str:
        if v not in ("beginner", "intermediate", "advanced"):
            raise ValueError("Invalid difficulty")
        return v


class ExerciseUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    category: str | None = None
    image_url: str | None = None
    video_url: str | None = None
    muscle_group: list[str] | None = None
    difficulty: str | None = None
    equipment: list[str] | None = None
    instructions: list[str] | None = None
    contradictions: list[str] | None = None
    is_active: bool | None = None


class ExerciseResponse(BaseModel):
    model_config = {"from_attributes": True, "populate_by_name": True}

    id: str = Field(alias="_id")
    name: str
    description: str
    category: str
    image_url: str
    video_url: str
    muscle_group: list[str]
    difficulty: str
    equipment: list[str]
    instructions: list[str]
    contradictions: list[str]
    is_active: bool

    @field_validator("id", mode="before")
    @classmethod
    def stringify_id(cls, v: object) -> str:
        return str(v)
