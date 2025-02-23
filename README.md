# Wearvana: The fashion social network

<img src="./frontend/public/logo_circle.svg" width="200" alt="Wearvana logo"/>

[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](https://opensource.org/licenses/MIT)

[![Contributor Covenant](https://img.shields.io/badge/Citizen%20Code%20of%20Conduct-2.3-pink.svg)](CODE_OF_CONDUCT.md)

##  What is Wearvana?
Wearvana is **the fashion social network**. Using Inditex Tech's APIs, Wearvana aims to be the social network of reference for fashion. Like any social network, you can connect with friends and others, share your photos and impress everyone with your outfits. With the clothing tagging feature, you can check where to buy your favorite influencer's jacket, or share where you buy your best shirt. On the other hand, Wearvana's assistant will help you get inspired and buy the perfect outfit for that special night. You can give it a simple text describing what you want, or upload an image to use as a reference - all without closing the app!

## Running Wearvana
### Backend
In order to run the backend, we strongly recommend using `uv`. `uv` is an extremely fast Python package installer and resolver, written in Rust, and designed as a drop-in replacement for pip and pip-tools workflows. To use it you only need to [install `uv`](https://docs.astral.sh/uv/getting-started/installation/). In order to install the project's dependencies, run the following command inside the `backend` directory:
```bash
  uv sync
```
To run the backend, run `uvicorn` using the following command:
```bash
uv run uvicorn --host 0.0.0.0 --port 8000 main:app
```
This will serve the backend on port `8000`. If you want a list of API methods, check out the `/docs` endpoint (`http://127.0.0.1:8000/docs` if you are running the backend locally).

If you are no ready to embrace the future just yet, you can install the necessary dependencies using just `pip`. We recommend creating a virtual environment and installing the project's dependencies inside using:
```bash
pip install -r requirements.txt
```
Finally, the command to run the backend is:
```bash
uvicorn --host 0.0.0.0 --port 8000 main:app
```

Lastly, we also provide a `Dockerfile` to enable running the backend inside a container.

#### Environment Variables
In order to run the backend successfully you will need to provide the following environment variables:
- `DB_FILE`: path for the SQLite database file.
- `PICTURES_DIR`: path for the pictures to be saved.
- `INDITEX_TOKEN_URL`: url to obtain the token from the Inditex Developer API.
- `INDITEX_CLIENT_ID`: id to obtain the token from the Inditex Developer API.
- `INDITEX_CLIENT_PASSWORD`: password to obtain the token from the Inditex Developer API.
- `INDITEX_IMAGE_SEARCH_URL`: endpoint for the image search in the Inditex Developer API.
- `INDITEX_TEXT_SEARCH_URL`: endpoint for the text search in the Inditex Developer API.
- `PASSWORDLESS_DEV_SECRET`: private key for the paswordless.dev application.

### Frontend
To run the Wearvana frontend locally, you'll need Node.js installed on your system. The frontend is built using modern web technologies including React, Vite, and Tailwind CSS for a fast and responsive user experience.

First, navigate to the frontend directory:

```bash
cd frontend
```

Then, install all the necessary dependencies using npm (Node Package Manager):

```bash
npm install
```

This will install all required packages specified in the `package.json` file. Once the installation is complete, you can start the development server by running:

```bash
npm run dev
```

This command will start the Vite development server, which provides features like Hot Module Replacement (HMR) for a smooth development experience. The frontend will be available at `http://localhost:5173` by default.

For production builds, you can use:

```bash
npm run build
```

This will create an optimized production build in the `dist` directory, which you can then serve using any static file server.

Make sure to keep both the frontend and backend running simultaneously for the full Wearvana experience. The frontend will automatically handle API requests to the backend, providing a seamless user interface for interacting with the Wearvana platform.

## Deploying Wearvana


## Licenses used in the project
| **Library or Framework** | **License** |
|:------------------------:|:-----------:|
|           [Vite](https://vite.dev/)           |     [MIT](https://opensource.org/license/mit)     |
|           [React](https://es.react.dev/)          |     [MIT](https://opensource.org/license/mit)     |
|       [React-Router](https://reactrouter.com/)       |     [MIT](https://opensource.org/license/mit)     |
|         [React-DOM](https://legacy.reactjs.org/docs/react-dom.html)        |     [MIT](https://opensource.org/license/mit)     |
|          [FastAPI](https://fastapi.tiangolo.com/)         |     [MIT](https://opensource.org/license/mit)     |
|              [SQLite](https://www.sqlite.org/)            |      [MIT](https://opensource.org/license/mit)       |
|                [Pydantic](https://docs.pydantic.dev/latest/)          |       [MIT](https://opensource.org/license/mit)      |
|                [AIOHTTP](https://docs.aiohttp.org/en/stable/) | [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) |
|                [uv](https://astral.sh/blog/uv)          |       [MIT](https://opensource.org/license/mit)      |
|                [uvicorn](https://www.uvicorn.org/) | [BSD-3](https://opensource.org/license/bsd-3-clause) |
|     [passwordless](https://passwordless.dev) |  [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) |
|                [playwright](https://playwright.dev/) | [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)|
|     [docker](https://www.docker.com/) |  [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) |
| [Inkscape](https://inkscape.org/es/) | [MIT](https://opensource.org/licenses/MIT) |

### Other licenses and references
This project uses the API provided by INDITEX, subject to the terms and conditions found at [Terms and Conditions](https://developer.inditex.com/apimktplc/web/legal).

