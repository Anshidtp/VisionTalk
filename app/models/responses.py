from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class DocumentResponse(BaseModel):
    """Response model for document operations."""
    document_id: str = Field(..., description="Unique identifier for the document")
    filename: str = Field(..., description="Original filename")
    status: str = Field(..., description="Processing status")
    message: str = Field(..., description="Status message")
    error: Optional[str] = Field(None, description="Error message if processing failed")

class PageContent(BaseModel):
    """Model for page content in OCR response."""
    page_number: int = Field(..., description="Page number")
    markdown: str = Field(..., description="Page content in markdown format")
    images: Optional[Dict[str, str]] = Field(None, description="Images in the page")

class OCRResponse(BaseModel):
    """Response model for OCR processing results."""
    document_id: str = Field(..., description="Unique identifier for the document")
    filename: str = Field(..., description="Original filename")
    status: str = Field(..., description="Processing status")
    content: Optional[str] = Field(None, description="Extracted text content")
    display_content: Optional[str] = Field(None, description="Formatted display content")
    pages: Optional[List[PageContent]] = Field(None, description="Content by page")
    error: Optional[str] = Field(None, description="Error message if processing failed")

class ChatResponse(BaseModel):
    """Response model for chat operations."""
    document_id: str = Field(..., description="Document ID")
    query: str = Field(..., description="User's query")
    response: str = Field(..., description="Generated response")

class ChatHistoryResponse(BaseModel):
    """Response model for chat history."""
    document_id: str = Field(..., description="Document ID")
    messages: List[Dict[str, Any]] = Field(..., description="Chat messages")