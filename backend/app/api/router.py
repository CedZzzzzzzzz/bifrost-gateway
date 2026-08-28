from fastapi import APIRouter

from app.api.routes import gateway, health, cache, conversations

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(gateway.router, prefix="/api/v1", tags=["Gateway"])
api_router.include_router(cache.router, prefix="/api/v1", tags=["Cache"])
api_router.include_router(conversations.router, prefix="/api/v1", tags=["Conversations"])