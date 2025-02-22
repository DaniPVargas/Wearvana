from pydantic import BaseModel
from typing import Optional

class Reference(BaseModel):
    clothing_name: str
    link: str
    current_price: float
    original_price: Optional[float]
    brand: str


class Tag(Reference):
    x_coord: int
    y_coord: int


class Post(BaseModel):
    post_id: Optional[str] = None
    user_id: Optional[str] = None
    title: str
    image: str
    tags: list[Tag]


class User(BaseModel):
    user_id: str
    user_alias: str
    description: str
    profile_picture_url: Optional[str] = None

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