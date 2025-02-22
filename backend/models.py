from pydantic import BaseModel
from typing import Optional

class Reference(BaseModel):
    name: str
    link: str
    current_price: float
    original_price: Optional[float]
    brand: str


class Tag(Reference):
    x: int
    y: int


class Post(BaseModel):
    title: str
    image: str
    tags: list[Tag]


class User(BaseModel):
    username: str
    user_id: str
    profile_picture: str
