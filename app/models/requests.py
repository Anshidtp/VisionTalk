from pydantic import BaseModel, HttpUrl, Field

class DocumentURLRequest(BaseModel):
    """Request model for processing a document from a URL."""
    url: str = Field(..., description="URL of the document to process")

class ChatRequest(BaseModel):
    """Request model for chatting with a document."""
    query: str = Field(..., description="User's query about the document")