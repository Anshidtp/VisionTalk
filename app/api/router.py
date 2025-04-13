from fastapi import APIRouter
from app.api.endpoints import documents, chat

# Create API router
api_router = APIRouter()

# Include endpoint routers
api_router.include_router(documents.router, prefix="/documents", tags=["documents"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])