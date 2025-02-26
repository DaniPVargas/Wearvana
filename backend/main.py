# SPDX-FileCopyrightText: 2025 Wearvana
# SPDX-License-Identifier: MIT

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic_settings import BaseSettings, SettingsConfigDict
import requests
import shutil
import sqlite3
import uuid
from PIL import Image
from pathlib import Path
from typing import Any
from datetime import datetime, timedelta
import aiohttp

from passwordless import (
    PasswordlessClientBuilder,
    PasswordlessOptions,
    RegisterToken,
    RegisteredToken,
    VerifySignIn,
    VerifiedUser,
)

from models import *


class Settings(BaseSettings):
    db_file: str
    pictures_dir: str
    inditex_text_search_url: str
    inditex_image_search_url: str
    inditex_token_url: str
    inditex_client_id: str
    inditex_client_password: str
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
        payload = "scope=technology.catalog.read&grant_type=client_credentials"
        headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "PostmanRuntime/7.43.0",
        }
        res = requests.post(
            url=self.token_url,
            auth=(self.user_id, self.user_pwd),
            headers=headers,
            data=payload,
        )
        res.raise_for_status()
        res = res.json()
        self.token = res["id_token"]
        self.expiry_date = datetime.now() + timedelta(seconds=res["expires_in"] - 600)


def init_db(settings):
    conn = sqlite3.connect(settings.db_file)
    cursor = conn.cursor()

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            user_id TEXT PRIMARY KEY,
            complete_name TEXT NOT NULL,
            user_alias TEXT NOT NULL,
            description TEXT,
            profile_picture_url TEXT
        )
    """
    )

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS posts (
            post_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT,
            image_url TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        )
    """
    )

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS relationships (
            relation_id INTEGER PRIMARY KEY AUTOINCREMENT,
            follower_id TEXT NOT NULL,
            followed_id TEXT NOT NULL,
            FOREIGN KEY (follower_id) REFERENCES users(follower_id),
            FOREIGN KEY (followed_id) REFERENCES users(followed_id)
        )
    """
    )

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS tags (
            tag_id INTEGER PRIMARY KEY AUTOINCREMENT,
            post_id INTEGER NOT NULL,
            x_coord FLOAT NOT NULL,
            y_coord FLOAT NOT NULL,
            clothing_name TEXT NOT NULL,
            current_price FLOAT NOT NULL,
            original_price FLOAT,
            brand TEXT NOT NULL,
            link TEXT NOT NULL,
            FOREIGN KEY (post_id) REFERENCES posts(post_if)
        )
    """
    )

    conn.commit()
    conn.close()


# origins = ["https://wearvana.netlify.app"]

settings = Settings()

tags_metadata = [
    {"name": "Auth Methods", "description": "Authentication related methods"},
    {"name": "User Methods", "description": "User related methods"},
    {"name": "Posts Methods", "description": "Posts related methods"},
    {"name": "Relationship Methods", "description": "Relationship related methods"},
    {"name": "Inditex API Methods", "description": "Inditex API related methods"},
    {"name": "Auxiliary Methods", "description": "Picture-saving related methods"},
]

app = FastAPI(openapi_tags=tags_metadata)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

passwordless_client = PasswordlessClientBuilder(
    PasswordlessOptions(settings.passwordless_dev_secret)
).build()
inditex_token = InditexToken(
    settings.inditex_token_url,
    settings.inditex_client_id,
    settings.inditex_client_password,
)

init_db(settings)


def get_db():
    conn = sqlite3.connect(settings.db_file)
    conn.row_factory = sqlite3.Row  # Permite acceder a los resultados como diccionarios
    return conn


# API requests


@app.post("/auth", tags=["Auth Methods"])
def authenticate(body: AuthBody) -> VerifiedUser:
    verify_sign_in = VerifySignIn(body.token)
    authenticated_user = passwordless_client.sign_in(verify_sign_in)
    return authenticated_user


@app.get("/users", tags=["User Methods"])
def get_users() -> list[User]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users")
    users = cursor.fetchall()
    conn.close()

    return [
        {
            "user_id": user[0],
            "complete_name": user[1],
            "user_alias": user[2],
            "description": user[3],
            "profile_picture_url": user[4],
        }
        for user in users
    ]


@app.get("/users/{user_id}", tags=["User Methods"])
async def get_user_info(user_id: str) -> User:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT user_id, complete_name, user_alias, description, profile_picture_url FROM users WHERE user_id = ?",
        (user_id,),
    )
    user = cursor.fetchone()

    conn.close()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    else:
        result = {
            "user_id": user[0],
            "complete_name": user[1],
            "user_alias": user[2],
            "description": user[3],
            "profile_picture_url": user[4],
        }
        return result


@app.post("/users", tags=["User Methods"])
def create_user(create_user_body: CreateUserBody) -> str:
    conn = get_db()
    cursor = conn.cursor()

    user_id = str(uuid.uuid4())

    complete_name = create_user_body.complete_name
    user_alias = create_user_body.user_alias
    description = create_user_body.description
    profile_picture_url = create_user_body.profile_picture_url

    try:
        cursor.execute(
            "INSERT INTO users (user_id, complete_name, user_alias, description, profile_picture_url) VALUES (?, ?, ?, ?, ?)",
            (user_id, complete_name, user_alias, description, profile_picture_url),
        )
        conn.commit()
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Username already exists")

    conn.close()

    register_token = RegisterToken(
        user_id=user_id, username=user_alias, display_name=user_alias
    )

    try:
        response: RegisteredToken = passwordless_client.register_token(register_token)
        return response.token
    except Exception as e:
        return JSONResponse({"error": "Alias xa rexistrado"}, status_code=409)


@app.patch("/users/{user_id}", tags=["User Methods"])
async def update_user_info(
    user_id: str, update_user_body: UpdateUserBody
) -> dict[str, str]:
    conn = get_db()
    cursor = conn.cursor()

    complete_name = update_user_body.complete_name
    description = update_user_body.description
    profile_picture_url = update_user_body.profile_picture_url

    cursor.execute(
        "UPDATE users SET complete_name = ?, description = ?, profile_picture_url = ? WHERE user_id = ?",
        (complete_name, description, profile_picture_url, user_id),
    )
    conn.commit()

    conn.close()

    return {"message": "User updated successfully"}


@app.get("/users/{user_id}/posts", tags=["Posts Methods"])
async def get_user_posts(user_id: str) -> list[Post]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM posts WHERE user_id = ?", (user_id,))
    posts = cursor.fetchall()

    posts_results = []

    for row in posts:
        posts_results.append(
            {
                "post_id": row["post_id"],
                "user_id": row["user_id"],
                "title": row["title"],
                "image_url": row["image_url"],
                "tags": [],
            }
        )

        cursor.execute("SELECT * FROM tags WHERE post_id = ?", (row["post_id"],))
        tags = cursor.fetchall()

        for t in tags:
            posts_results[-1]["tags"].append(
                {
                    "tag_id": t["tag_id"],
                    "post_id": t["post_id"],
                    "x_coord": t["x_coord"],
                    "y_coord": t["y_coord"],
                    "clothing_name": t["clothing_name"],
                    "current_price": t["current_price"],
                    "original_price": t["original_price"],
                    "brand": t["brand"],
                    "link": t["link"],
                }
            )

    conn.close()

    return [post for post in posts_results]


@app.get("/users/{user_id}/followed", tags=["Relationship Methods"])
async def get_followed(user_id: str) -> list[str]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT followed_id FROM relationships WHERE follower_id = ?", (user_id,)
    )
    followed = cursor.fetchall()
    conn.close()

    return [f["followed_id"] for f in followed]


@app.get("/users/{user_id}/followers", tags=["Relationship Methods"])
async def get_followers(user_id: str) -> list[str]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT follower_id FROM relationships WHERE followed_id = ?", (user_id,)
    )
    followed = cursor.fetchall()
    conn.close()

    return [f[0] for f in followed]


@app.post("/users/{user_id}/followed", tags=["Relationship Methods"])
async def follow_user(user_id: str, follow_user_body: FollowUserBody) -> dict[str, str]:

    followed_id = follow_user_body.followed_id

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO relationships (follower_id, followed_id) VALUES (?, ?)",
        (user_id, followed_id),
    )
    conn.commit()

    return {"message": "User followed successfully"}


@app.get("/users/{user_id}/feed", tags=["Posts Methods"])
async def get_user_feed(user_id: str) -> list[Post]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * \
                    FROM posts \
                    WHERE user_id IN ( \
                        SELECT followed_id \
                        FROM relationships \
                        WHERE follower_id = ?)",
        (user_id,),
    )
    posts = cursor.fetchall()

    posts_results = []

    for row in posts:
        posts_results.append(
            {
                "post_id": row["post_id"],
                "user_id": row["user_id"],
                "title": row["title"],
                "image_url": row["image_url"],
                "tags": [],
            }
        )

        cursor.execute("SELECT * FROM tags WHERE post_id = ?", (row["post_id"],))
        tags = cursor.fetchall()

        for t in tags:
            posts_results[-1]["tags"].append(
                {
                    "x_coord": t["x_coord"],
                    "y_coord": t["y_coord"],
                    "clothing_name": t["clothing_name"],
                    "current_price": t["current_price"],
                    "original_price": t["original_price"],
                    "brand": t["brand"],
                    "link": t["link"],
                }
            )

    conn.close()

    return [post for post in posts_results]


@app.post("/users/{user_id}/posts", tags=["Posts Methods"])
async def create_post(user_id: str, upload_post_body: UploadPostBody) -> dict[str, str]:
    conn = get_db()
    cursor = conn.cursor()

    image_url = upload_post_body.image_url
    title = upload_post_body.title
    tags = upload_post_body.tags

    cursor.execute(
        "INSERT INTO posts (user_id, title, image_url) VALUES (?, ?, ?)",
        (user_id, title, image_url),
    )

    for t in tags:
        post_id = cursor.lastrowid
        x_coord = t.x_coord
        y_coord = t.y_coord
        clothing_name = t.clothing_name
        current_price = t.current_price
        original_price = t.original_price
        brand = t.brand
        link = t.link

        cursor.execute(
            "INSERT INTO tags (post_id, x_coord, y_coord, clothing_name, current_price, original_price, brand, link) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (
                post_id,
                x_coord,
                y_coord,
                clothing_name,
                current_price,
                original_price,
                brand,
                link,
            ),
        )

    conn.commit()

    return {"message": "Post uploaded successfully"}


@app.post("/clothing:text_search", tags=["Inditex API Methods"])
async def search_clothing(query: str, brand: str = "") -> list[Reference]:
    token = inditex_token.get_token()

    params = {"query": query, "brand": brand}

    headers = {
        "User-Agent": "PostmanRuntime/7.43.0",
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }

    async with aiohttp.ClientSession() as session:
        async with session.get(
            settings.inditex_text_search_url, params=params, headers=headers
        ) as response:
            response = await response.json()

            references = []

            for r in response:
                ref = {
                    "clothing_name": r["name"],
                    "link": r["link"],
                    "current_price": r["price"]["value"]["current"],
                    "original_price": r["price"]["value"]["original"],
                    "brand": r["brand"],
                }
                references.append(ref)

            return references


@app.post("/users/{user_id}/pictures", tags=["Auxiliary Methods"])
def upload_picture(user_id: str, file: UploadFile = File(...)) -> dict[str, str]:
    Path(f"{settings.pictures_dir}/{user_id}").mkdir(parents=True, exist_ok=True)

    picture_id = str(uuid.uuid4())

    temp_path = f"/tmp/image_temp"

    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    with Image.open(temp_path) as img:
        img = img.convert("RGB")
        img.save(
            f"{settings.pictures_dir}/{user_id}/{picture_id}.jpg", "JPEG", quality=95
        )

    Path(temp_path).unlink()

    picture_url = f"https://wearvana.onrender.com/pictures/{user_id}/{picture_id}"

    return {"message": "Image uploaded successfully", "image_url": picture_url}


@app.post("/clothing:image_search", tags=["Inditex API Methods"])
async def search_clothing_by_image(picture_url: str) -> list[Reference]:

    token = inditex_token.get_token()

    params = {"image": picture_url}

    headers = {
        "User-Agent": "PostmanRuntime/7.43.0",
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }

    async with aiohttp.ClientSession() as session:
        async with session.get(
            settings.inditex_image_search_url, headers=headers, params=params
        ) as response:
            response = await response.json()
            references = []

            for r in response:
                ref = {
                    "clothing_name": r["name"],
                    "link": r["link"],
                    "current_price": r["price"]["value"]["current"],
                    "original_price": r["price"]["value"]["original"],
                    "brand": r["brand"],
                }
                references.append(ref)

            return references


@app.get("/pictures/{user_id}/{picture_id}", tags=["Auxiliary Methods"])
def get_picture(user_id: str, picture_id: str) -> dict[str, str]:
    return FileResponse(
        f"{settings.pictures_dir}/{user_id}/{picture_id}.jpg", media_type="image/jpeg"
    )
