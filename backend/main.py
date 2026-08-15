from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.router import api_router
from app.core.config import VERCEL_FRONTEND_URL, BIFROST_API_KEY
from app.core.lifespan import lifespan


app = FastAPI(
    title = "Bifrost Gateway",
    description = "Intelligent AI proxy gateway & token optimization service for LLMS.",
    version = "1.0.0",
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

@app.middleware("http")
async def validate_api_key(request: Request, call_next):
    if request.url.path.startswith("/api/v1") and request.method != "OPTIONS":
        key = request.headers.get("Authorization", "").replace("Bearer ", "")
        if key != BIFROST_API_KEY:
            return JSONResponse(status_code=401, content={"detail": "Unauthorized"})
    return await call_next(request)

app.include_router(api_router)