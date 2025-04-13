import os
import tempfile
import logging
from typing import Dict, Any
from mistralai import Mistral
from mistralai import DocumentURLChunk, ImageURLChunk
from mistralai.models import OCRResponse

from app.core.exceptions import ServiceError

logger = logging.getLogger(__name__)

class OCRService:
    """Service for interacting with Mistral API."""
    
    def __init__(self, api_key: str):
        """Initialize Mistral client."""
        self.api_key = api_key
        self.client = Mistral(api_key=api_key)
        logger.info("Mistral service initialized")
    
    def upload_pdf(self, content: bytes, filename: str) -> str:
        """Upload a PDF to Mistral's API and retrieve a signed URL for processing."""
        logger.info(f"Uploading PDF: {filename}")
        
        try:
            with tempfile.TemporaryDirectory() as temp_dir:
                temp_path = os.path.join(temp_dir, filename)
                
                with open(temp_path, "wb") as tmp:
                    tmp.write(content)
                
                with open(temp_path, "rb") as file_obj:
                    file_upload = self.client.files.upload(
                        file={"file_name": filename, "content": file_obj},
                        purpose="ocr"
                    )
                
                signed_url = self.client.files.get_signed_url(file_id=file_upload.id)
                logger.info(f"PDF uploaded successfully, signed URL obtained")
                return signed_url.url
                
        except Exception as e:
            logger.error(f"Error uploading PDF: {str(e)}")
            raise ServiceError(f"Error uploading PDF: {str(e)}")
    
    def process_ocr(self, document_source: Dict[str, Any]) -> OCRResponse:
        """Process document with OCR API based on source type."""
        logger.info(f"Processing OCR for document source type: {document_source['type']}")
        
        try:
            if document_source["type"] == "document_url":
                return self.client.ocr.process(
                    document=DocumentURLChunk(document_url=document_source["document_url"]),
                    model="mistral-ocr-latest",
                    include_image_base64=True
                )
            elif document_source["type"] == "image_url":
                return self.client.ocr.process(
                    document=ImageURLChunk(image_url=document_source["image_url"]),
                    model="mistral-ocr-latest",
                    include_image_base64=True
                )
            else:
                raise ServiceError(f"Unsupported document source type: {document_source['type']}")
                
        except Exception as e:
            logger.error(f"Error processing OCR: {str(e)}")
            raise ServiceError(f"Error processing OCR: {str(e)}")
    
    def replace_images_in_markdown(self, markdown_str: str, images_dict: dict) -> str:
        """Replace image placeholders with base64 encoded images in markdown."""
        for img_name, base64_str in images_dict.items():
            markdown_str = markdown_str.replace(f"![{img_name}]({img_name})", f"![{img_name}]({base64_str})")
        return markdown_str
    
    def get_combined_markdown(self, ocr_response: OCRResponse) -> str:
        """Combine markdown from all pages with their respective images."""
        markdowns = list[str] = []
        for page in ocr_response.pages:
            image_data = {}
            for img in page.images:
                image_data[img.id] = img.image_base64
            markdowns.append(self.replace_images_in_markdown(page.markdown, image_data))

        return "\n\n".join(markdowns)