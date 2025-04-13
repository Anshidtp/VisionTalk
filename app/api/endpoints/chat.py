from fastapi import APIRouter, Depends, HTTPException
import logging

from app.models.requests import ChatRequest
from app.models.responses import ChatResponse
from app.services.llm_service import LLMService
from app.core.exceptions import ServiceError, NotFoundError,ValidationError
from app.config import get_settings, Settings
from app.storage.document_store import DocumentStore

router = APIRouter()
logger = logging.getLogger(__name__)

def get_gemini_service(settings: Settings = Depends(get_settings)):
    """Dependency to get Gemini service."""
    return LLMService(settings.GOOGLE_API_KEY)

def get_document_store(settings: Settings = Depends(get_settings)):
    """Dependency to get document store."""
    return DocumentStore(upload_dir=settings.UPLOAD_DIR)

@router.post("/{document_id}", response_model=ChatResponse)
async def chat_with_document(
    document_id: str,
    request: ChatRequest,
    gemini_service: LLMService = Depends(get_gemini_service),
    document_store: DocumentStore = Depends(get_document_store)
):
    """Chat with a processed document."""
    logger.info(f"Chat request for document: {document_id}")
    
    try:
        # Get document
        document = document_store.get_document(document_id)
        if not document:
            raise NotFoundError("Document not found")
        
        if document.get("status") != "completed":
            raise ValidationError(f"Document processing not completed. Current status: {document.get('status')}")
        
        # Get document content
        document_content = document.get("content", "")
        if not document_content:
            raise ValidationError("No document content available")
        
        # Generate response
        response = gemini_service.generate_response(document_content, request.query)
        
        # Save conversation history (optional)
        document_store.save_chat_message(
            document_id=document_id,
            role="user",
            content=request.query
        )
        document_store.save_chat_message(
            document_id=document_id,
            role="assistant",
            content=response
        )
        
        return ChatResponse(
            document_id=document_id,
            query=request.query,
            response=response
        )
        
    except Exception as e:
        if isinstance(e, (NotFoundError, ValidationError)):
            raise e
        logger.error(f"Error processing chat request: {str(e)}")
        raise ServiceError(f"Error processing chat request: {str(e)}")