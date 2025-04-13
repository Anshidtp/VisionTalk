import os
import json
import shutil
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

class DocumentStore:
    """Service for storing and retrieving documents and processing results."""
    
    def __init__(self, upload_dir: str = "uploads"):
        """Initialize document store."""
        self.upload_dir = upload_dir
        self.metadata_dir = os.path.join(upload_dir, "metadata")
        self.files_dir = os.path.join(upload_dir, "files")
        self.chat_dir = os.path.join(upload_dir, "chat")
        
        # Create directories if they don't exist
        os.makedirs(self.metadata_dir, exist_ok=True)
        os.makedirs(self.files_dir, exist_ok=True)
        os.makedirs(self.chat_dir, exist_ok=True)
        
        logger.info(f"Document store initialized with upload directory: {upload_dir}")
    
    def save_document(self, document_id: str, file_path: str, filename: str) -> str:
        """Save document file and initialize metadata."""
        logger.info(f"Saving document: {document_id}, filename: {filename}")
        
        # Create document directory
        doc_dir = os.path.join(self.files_dir, document_id)
        os.makedirs(doc_dir, exist_ok=True)
        
        # Save file
        file_ext = os.path.splitext(filename)[1]
        dest_path = os.path.join(doc_dir, f"document{file_ext}")
        shutil.copy(file_path, dest_path)
        
        # Create metadata
        metadata = {
            "document_id": document_id,
            "filename": filename,
            "original_path": dest_path,
            "created_at": datetime.now().isoformat(),
            "status": "uploaded",
            "type": "file"
        }
        
        # Save metadata
        self._save_metadata(document_id, metadata)
        
        return dest_path
    
    def save_url(self, document_id: str, url: str) -> None:
        """Save document URL and initialize metadata."""
        logger.info(f"Saving document URL: {document_id}, URL: {url}")
        
        # Create metadata
        metadata = {
            "document_id": document_id,
            "filename": os.path.basename(url),
            "url": url,
            "created_at": datetime.now().isoformat(),
            "status": "uploaded",
            "type": "url"
        }
        
        # Save metadata
        self._save_metadata(document_id, metadata)
    
    def update_document(self, document_id: str, **kwargs) -> None:
        """Update document metadata."""
        logger.info(f"Updating document: {document_id}")
        
        # Get existing metadata
        metadata = self._get_metadata(document_id)
        if not metadata:
            logger.error(f"Document not found: {document_id}")
            return
        
        # Update metadata
        metadata.update(kwargs)
        metadata["updated_at"] = datetime.now().isoformat()
        
        # Save updated metadata
        self._save_metadata(document_id, metadata)
    
    def get_document(self, document_id: str) -> Optional[Dict[str, Any]]:
        """Get document metadata and content."""
        logger.info(f"Retrieving document: {document_id}")
        
        # Get metadata
        metadata = self._get_metadata(document_id)
        if not metadata:
            logger.warning(f"Document not found: {document_id}")
            return None
        
        return metadata
    
    def save_chat_message(self, document_id: str, role: str, content: str) -> None:
        """Save chat message for a document."""
        logger.info(f"Saving chat message for document: {document_id}, role: {role}")
        
        # Create chat directory for document if it doesn't exist
        doc_chat_dir = os.path.join(self.chat_dir, document_id)
        os.makedirs(doc_chat_dir, exist_ok=True)
        
        # Read existing chat history
        chat_file = os.path.join(doc_chat_dir, "chat_history.json")
        chat_history = []
        
        if os.path.exists(chat_file):
            try:
                with open(chat_file, "r") as f:
                    chat_history = json.load(f)
            except Exception as e:
                logger.error(f"Error reading chat history: {str(e)}")
        
        # Add new message
        chat_history.append({
            "role": role,
            "content": content,
            "timestamp": datetime.now().isoformat()
        })
        
        # Save updated chat history
        try:
            with open(chat_file, "w") as f:
                json.dump(chat_history, f, indent=2)
        except Exception as e:
            logger.error(f"Error saving chat history: {str(e)}")
    
    def get_chat_history(self, document_id: str) -> List[Dict[str, Any]]:
        """Get chat history for a document."""
        logger.info(f"Retrieving chat history for document: {document_id}")
        
        # Get chat file path
        chat_file = os.path.join(self.chat_dir, document_id, "chat_history.json")
        
        # Return empty list if chat file doesn't exist
        if not os.path.exists(chat_file):
            return []
        
        # Read chat history
        try:
            with open(chat_file, "r") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error reading chat history: {str(e)}")
            return []
    
    def _save_metadata(self, document_id: str, metadata: Dict[str, Any]) -> None:
        """Save document metadata."""
        metadata_file = os.path.join(self.metadata_dir, f"{document_id}.md")
        
        try:
            with open(metadata_file, "w") as f:
                json.dump(metadata, f, indent=2)
        except Exception as e:
            logger.error(f"Error saving metadata: {str(e)}")
    
    def _get_metadata(self, document_id: str) -> Optional[Dict[str, Any]]:
        """Get document metadata."""
        metadata_file = os.path.join(self.metadata_dir, f"{document_id}.md")
        
        if not os.path.exists(metadata_file):
            return None
        
        try:
            with open(metadata_file, "r") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error reading metadata: {str(e)}")
            return None