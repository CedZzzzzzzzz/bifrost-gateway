from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import VERCEL_FRONTEND_URL
from app.core.lifespan import lifespan


app = FastAPI(
    title = "Bifrost Gateway",
    description = "Intelligent AI proxy gateway & token optimization service for LLMS.",
    version = "0.1.0",
    lifespan = lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        VERCEL_FRONTEND_URL,
    ],
    allow_origin_regex = r"^https://.*\.vercel\.app$",
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"],
)

app.include_router(api_router)