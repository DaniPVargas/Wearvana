# Wearvana: The fashion social network

<img src="./frontend/public/logo_circle.svg" width="200" alt="Wearvana logo"/>

[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](https://opensource.org/licenses/MIT)

[![Contributor Covenant](https://img.shields.io/badge/Citizen%20Code%20of%20Conduct-2.3-pink.svg)](CODE_OF_CONDUCT.md)

##  What is Wearvana?
Wearvana, as our logo says, is **_the fashion social network_**. Using Inditex's recently released APIs, Wearvana aims to be the social network of reference for fashion. Like any social network, you can connect with friends and others, share your photos and impress everyone with your outfits. With the clothing tagging functionality, you can check where to buy your favorite influencer's favorite jacket, or share where you buy your best shirt. On the other hand, Wearvana's assistant will help you get inspired and buy the perfect outfit for that special night. You can give it a simple text describing what you want, or upload an image to use as a reference - all without closing the app!

## Running Wearvana locally
### Wearvana backend
The first thing you need to use Wearvana locally is to prepare and run the backedn, which will be the responsible of responding all your requests. To have a fast an easy way of prepare and install all of the necessary dependencies, we have chosen to use `uv`. `uv` is an extremely fast Python package installer and resolver, written in Rust, and designed as a drop-in replacement for pip and pip-tools workflows. To use it you only need to install `uv` [How to install `uv`?](https://docs.astral.sh/uv/getting-started/installation/), change to `backend` directory and run the following command from the terminal:

`uv sync`

After that, all the necessary dependencies will be installed (extremely fast, as we said before), and finally you only need to run `uv run uvicorn --host 0.0.0.0 --port 8000 main:app`. This will make the backend available in your computer in the `http://0.0.0.0:8000/` url. If you need help with the API methods, `http://0.0.0.0:8000/docs` will show you all the necessary documentation, including the posibility of running commands.

However, if you are not ready to embrace the future just yet, we have also think in you. Inside the `backend` folder, we have left a `requirements.txt` file to install with classic `pip install -r requirements.txt` command. Finally, the command to run the backend will be `uvicorn --host 0.0.0.0 --port 8000 main:app`.

### Wearvana frontend

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

