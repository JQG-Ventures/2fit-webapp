from pydantic import BaseModel, Field, field_validator


class MuscleTaxonomyItem(BaseModel):
    model_config = {"populate_by_name": True}

    id: str = Field(alias="_id", validation_alias="_id")
    code: str
    name: str
    body_region: str
    visual_cluster: str
    heatmap_slot: str
    sort_order: int

    @field_validator("id", mode="before")
    @classmethod
    def stringify_id(cls, v: object) -> str:
        return str(v)
