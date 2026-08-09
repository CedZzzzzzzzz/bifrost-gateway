from fastapi import APIRouter

from app.api.routes import gateway, health

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(gateway.router, prefix="/api/v1", tags=["Gateway"])