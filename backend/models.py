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
    id: str
    user_id: str
    title: str
    image: str
    tags: list[Tag]


class User(BaseModel):
    id: str
    user_alias: str
    description: str
    profile_picture: str

class AuthBody(BaseModel):
    token: str

class CreateUserBody(BaseModel):
    user_alias: str
    description: Optional[str] = None
    profile_picture_url: Optional[str] = None

class FollowUserBody(BaseModel):
    follower_id: str
    followed_id: str

class UploadPostBody(BaseModel):
    user_id: str
    post: Post