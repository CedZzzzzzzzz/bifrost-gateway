from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse

from app.db.cache import (
    fetch_cache_entries,
    fetch_cache_stats,
    delete_cache_entry,
    delete_all_cache_entries,
)

router = APIRouter()

@router.get("/cache")
async def cache_entries_list(page: int = 1, page_size: int = 20) -> JSONResponse:
    try:
        entries = await fetch_cache_entries(page = page, page_size = page_size)
        return JSONResponse(content={
            "entries": entries,
            "page": page,
            "page_size": page_size,
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics")
async def get_analytics() -> JSONResponse:
    try:
        stats = await fetch_cache_stats()
        return JSONResponse(content=stats)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/cache/{context_hash}")
async def remove_cache_entry(context_hash: str) -> JSONResponse:
    try:
        deleted = await delete_cache_entry(context_hash)
        if deleted:
            return JSONResponse(content={"message": "Cache entry deleted successfully."})
        else:
            raise HTTPException(status_code=404, detail="Cache entry not found.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/cache")
async def clear_all_cache() -> JSONResponse:
    try:
        total_deleted = await delete_all_cache_entries()
        return JSONResponse(content={"message": f"All cache entries deleted successfully. Total deleted: {total_deleted}"})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))