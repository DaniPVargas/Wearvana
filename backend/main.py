from fastapi import FastAPI, File, UploadFile
from pydantic_settings import BaseSettings, SettingsConfigDict
import requests
import shutil
import sqlite3
import uuid
from bs4 import BeautifulSoup
from typing import Any
from datetime import datetime, timedelta

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
    inditex_token_url: str
    inditex_client_id: str
    inditex_client_password: str
    inditex_scope: str
    passwordless_dev_secret: str

    model_config = SettingsConfigDict(env_file=".env")

class InditexToken:
    def __init__(self, token_url: str, user_id: str, user_pwd: str):
        self.token_url = token_url
        self.user_id = user_id
        self.user_pwd = user_pwd

        self._fetch_token()
    
    def get_token(self):
        if datetime.now() >= self.expiry_date:
            self._fetch_token()

        return self.token

    def _fetch_token(self):
        payload = 'scope=technology.catalog.read&grant_type=client_credentials'
        headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            "User-Agent": "PostmanRuntime/7.43.0"
        }
        res = requests.post(url=self.token_url, auth=(self.user_id, self.user_pwd), headers=headers, data=payload)     
        res.raise_for_status()
        res = res.json()
        self.token = res["id_token"]
        self.expiry_date = datetime.now() + timedelta(seconds=res["expires_in"] - 600)

settings = Settings()
app = FastAPI()
passwordless_client = PasswordlessClientBuilder(PasswordlessOptions(settings.passwordless_dev_secret)).build()
inditex_token = InditexToken(settings.inditex_token_url, settings.inditex_client_id, settings.inditex_client_password)

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
async def search_clothing(query: str, brand: str = "") -> list[Reference]:
    token = inditex_token.get_token()

    params = {
        "query": query,
        "brand": brand
    }

    headers = {
        'User-Agent': "PostmanRuntime/7.43.0",
        "Authorization": f"Bearer {token}",
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
    pass

