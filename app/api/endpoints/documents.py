from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from uuid import uuid4
import os
import tempfile
import logging
import shutil

from app.models.requests import DocumentURLRequest
from app.models.responses import DocumentResponse, OCRResponse
from app.services.ocr_service import OCRService
from app.core.exceptions import ServiceError, ValidationError
from app.config import get_settings, Settings
from app.storage.document_store import DocumentStore

router = APIRouter()
logger = logging.getLogger(__name__)

def get_mistral_service(settings: Settings = Depends(get_settings)):
    """Dependency to get Mistral service."""
    return OCRService(settings.MISTRAL_API_KEY)

def get_document_store(settings: Settings = Depends(get_settings)):
    """Dependency to get document store."""
    return DocumentStore(upload_dir=settings.UPLOAD_DIR)

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    mistral_service: OCRService = Depends(get_mistral_service),
    document_store: DocumentStore = Depends(get_document_store),
    settings: Settings = Depends(get_settings)
):
    """Upload a document (PDF or image) for OCR processing."""
    logger.info(f"Processing uploaded file: {file.filename}")
    
    # Validate file size
    if file.size > settings.MAX_UPLOAD_SIZE:
        raise ValidationError(f"File too large. Maximum size is {settings.MAX_UPLOAD_SIZE / (1024 * 1024)}MB")
    
    # Validate file type
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ['.pdf', '.png', '.jpg', '.jpeg']:
        raise ValidationError("Only PDF and image files (PNG, JPG) are supported")
    
    try:
        # Save file to temporary location
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp_path = tmp.name
        
        # Generate document ID
        document_id = str(uuid4())
        
        # Store document and get access path
        document_path = document_store.save_document(document_id, tmp_path, file.filename)
        
        # Process document with OCR in background
        background_tasks.add_task(
            process_document_ocr,
            document_id=document_id,
            file_path=document_path,
            file_name=file.filename,
            mistral_service=mistral_service,
            document_store=document_store
        )
        
        return DocumentResponse(
            document_id=document_id,
            filename=file.filename,
            status="processing",
            message="Document uploaded and OCR processing started"
        )
        
    except Exception as e:
        logger.error(f"Error processing document upload: {str(e)}")
        raise ServiceError(f"Error processing document: {str(e)}")
    finally:
        # Clean up temp file if it exists
        if 'tmp_path' in locals() and os.path.exists(tmp_path):
            os.unlink(tmp_path)

@router.post("/process-url", response_model=DocumentResponse)
async def process_document_url(
    request: DocumentURLRequest,
    background_tasks: BackgroundTasks,
    mistral_service: OCRService = Depends(get_mistral_service),
    document_store: DocumentStore = Depends(get_document_store)
):
    """Process a document from a URL."""
    logger.info(f"Processing document from URL: {request.url}")
    
    try:
        # Generate document ID
        document_id = str(uuid4())
        
        # Store document URL
        document_store.save_url(document_id, request.url)
        
        # Process document with OCR in background
        background_tasks.add_task(
            process_url_ocr,
            document_id=document_id,
            url=request.url,
            mistral_service=mistral_service,
            document_store=document_store
        )
        
        return DocumentResponse(
            document_id=document_id,
            filename=os.path.basename(request.url),
            status="processing",
            message="Document URL submitted and OCR processing started"
        )
        
    except Exception as e:
        logger.error(f"Error processing document URL: {str(e)}")
        raise ServiceError(f"Error processing document URL: {str(e)}")

@router.get("/{document_id}", response_model=OCRResponse)
async def get_document(
    document_id: str,
    document_store: DocumentStore = Depends(get_document_store)
):
    """Get document OCR processing results."""
    logger.info(f"Retrieving document: {document_id}")
    
    try:
        document = document_store.get_document(document_id)
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        return document
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        logger.error(f"Error retrieving document: {str(e)}")
        raise ServiceError(f"Error retrieving document: {str(e)}")

async def process_document_ocr(
    document_id: str,
    file_path: str,
    file_name: str,
    mistral_service: OCRService,
    document_store: DocumentStore
):
    """Background task to process document with OCR."""
    logger.info(f"Starting OCR processing for document: {document_id}")
    
    try:
        # Determine if it's a PDF or image
        file_ext = os.path.splitext(file_name)[1].lower()
        
        if file_ext == '.pdf':
            # Process PDF
            with open(file_path, 'rb') as f:
                signed_url = mistral_service.upload_pdf(f.read(), file_name)
                ocr_result = mistral_service.process_ocr({"type": "document_url", "document_url": signed_url})
        else:
            # Process image
            import base64
            with open(file_path, 'rb') as f:
                img_base64 = base64.b64encode(f.read()).decode('utf-8')
                image_url = f"data:image/{file_ext[1:]};base64,{img_base64}"
                ocr_result = mistral_service.process_ocr({"type": "image_url", "image_url": image_url})
        
        # Extract text content
        content = ""
        display_content = ""
        
        for i, page in enumerate(ocr_result.pages):
            page_content = page.markdown.strip()
            if page_content:
                content += page_content + "\n\n"
                display_content += f"Page {i+1}:\n{page_content}\n\n----------\n\n"
        
        # Update document with OCR results
        document_store.update_document(
            document_id=document_id,
            content=content,
            display_content=display_content,
            ocr_result=ocr_result,
            status="completed"
        )
        
        logger.info(f"OCR processing completed for document: {document_id}")
        
    except Exception as e:
        logger.error(f"Error in OCR processing for document {document_id}: {str(e)}")
        document_store.update_document(
            document_id=document_id,
            status="failed",
            error=str(e)
        )

async def process_url_ocr(
    document_id: str,
    url: str,
    mistral_service: OCRService,
    document_store: DocumentStore
):
    """Background task to process document URL with OCR."""
    logger.info(f"Starting OCR processing for URL: {url}, document ID: {document_id}")
    
    try:
        # Process URL with OCR
        ocr_result = mistral_service.process_ocr({"type": "document_url", "document_url": url})
        
        # Extract text content
        content = ""
        display_content = ""
        
        for i, page in enumerate(ocr_result.pages):
            page_content = page.markdown.strip()
            if page_content:
                content += page_content + "\n\n"
                display_content += f"Page {i+1}:\n{page_content}\n\n----------\n\n"
        
        # Update document with OCR results
        document_store.update_document(
            document_id=document_id,
            content=content,
            display_content=display_content,
            ocr_result=ocr_result,
            status="completed"
        )
        
        logger.info(f"OCR processing completed for URL document: {document_id}")
        
    except Exception as e:
        logger.error(f"Error in OCR processing for URL document {document_id}: {str(e)}")
        document_store.update_document(
            document_id=document_id,
            status="failed",
            error=str(e)
        )
