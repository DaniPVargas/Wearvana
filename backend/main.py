from fastapi import FastAPI, File, UploadFile
from pydantic_settings import BaseSettings, SettingsConfigDict
import requests
import shutil
import sqlite3
import uuid
from bs4 import BeautifulSoup
from typing import Any

from passwordless import (
    PasswordlessClient,
    PasswordlessClientBuilder,
    PasswordlessOptions,
    RegisterToken,
    RegisteredToken,
    VerifySignIn,
    VerifiedUser
)

from models import User, Post, Reference, Tag

class Settings(BaseSettings):
    db_file: str
    pictures_dir: str
    inditex_text_search_url: str
    inditex_image_search_url: str
    inditex_key: str
    inditex_client_id: str
    inditex_scope: str
    passwordless_dev_secret: str

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()
app = FastAPI()
passwordless_client = PasswordlessClientBuilder(PasswordlessOptions(settings.passwordless_dev_secret)).build()

@app.post("/auth")
async def authenticate(token: str) -> VerifiedUser:
    verify_sign_in = VerifySignIn(token)
    return passwordless_client.sign_in(verify_sign_in)

@app.post("/users")
async def create_user(user_alias: str) -> Any:
    user_id = str(uuid.uuid4())

    register_token = RegisterToken(
        user_id=user_id,
        username=user_alias,
        aliases=[user_alias]
    )

    response: RegisteredToken = passwordless_client.register_token(register_token)

    return response.token

@app.get("/users")
async def get_users() -> list[User]:
    return {"message": settings.db_file}

@app.get("/users/{user_id}")
async def get_user_info(user_id: str) -> User:
    return {"message": "Hello World"}

@app.get("/users/{user_id}/posts")
async def get_user_posts(user_id: str) -> list[Post]:
    return {"message": "Hello World"}

@app.get("/users/{user_id}/followed")
async def get_followed(user_id: str) -> list[str]:
    return {"message": "Hello World"}

@app.get("/users/{user_id}/followers")
async def get_followers(user_id: str) -> list[str]:
    return {"message": "Hello World"}

@app.post("/users/{user_id}/followed")
async def follow_user(user_id: str) -> dict[str, str]:
    return {"message": "Hello World"}

@app.delete("/users/{user_id}/followed/{followed_id}")
async def unfollow_user(user_id: str, followed_id: str) -> dict[str, str]:
    return {"message": "Hello World"}

@app.delete("/users/{user_id}")
async def delete_user(user_id: str) -> dict[str, str]:
    return {"message": "Hello World"}

@app.post("/users/{user_id}/posts")
async def create_post(user_id: str) -> dict[str, str]:
    return {"message": "Hello World"}

@app.delete("/users/{user_id}/posts/{post_id}")
async def delete_post(user_id: str, post_id: str) -> dict[str, str]:
    return {"message": "Hello World"}

@app.get("/users/{user_id}/feed")
async def get_user_feed(user_id: str) -> list[Post]:
    return {"message": "Hello World"}

@app.post("/users/{user_id}/pictures")
async def upload_picture(user_id: str, file: UploadFile = File(...)) -> dict[str, str]:
    try:
        with open(f"{settings.picture_dir}/uploaded_image.png", "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        return {"message": "Image uploaded successfully"}
    except Exception as e:
        return {"error": str(e)}

## API Inditex

@app.post("/clothing:text_search")
async def search_clothing() -> list[Reference]:

    params = {
        "query": "shirt",
        "brand": "zara"
    }

    headers = {
        'User-Agent': "PostmanRuntime/7.43.0",
        "Authorization": f"Bearer {settings.inditex_key}",  
        "Content-Type": "application/json"
    }

    response = requests.get(settings.inditex_text_search_url, params=params, headers=headers)

    references = []

    for r in response.json():
        ref = {
            "name": r["name"], 
            "link": r["link"], 
            "current_price" : r["price"]["value"]["current"],
            "original_price" : r["price"]["value"]["original"],
            "brand": r["brand"],
            }
        references.append(ref)

    return references
        

@app.post("/clothing:image_search")
async def search_clothing_by_image(file: UploadFile = File(...)) -> list[Reference]:
    headers = {
        'User-Agent': "PostmanRuntime/7.43.0",
        "Authorization": f"Bearer {settings.inditex_key}",  
        "Content-Type": "application/json"
    }

    body = {
        "file": file
    }

    response = requests.get(settings.inditex_text_search_url, params=params, headers=headers, )

    references = []

    for r in response.json():
        ref = {
            "name": r["name"], 
            "link": r["link"], 
            "current_price" : r["price"]["value"]["current"],
            "original_price" : r["price"]["value"]["original"],
            "brand": r["brand"],
            }
        references.append(ref)

    return references

