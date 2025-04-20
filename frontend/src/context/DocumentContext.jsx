import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import documentService from '@services/documentService';
import { toast } from 'react-toastify';

const DocumentContext = createContext();

export function useDocument() {
  return useContext(DocumentContext);
}

export function DocumentProvider({ children }) {
  const [documents, setDocuments] = useState([]);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [uploadLoading, setUploadLoading] = useState(false);

  // Load documents from localStorage on mount
  useEffect(() => {
    const savedDocuments = localStorage.getItem('documents');
    if (savedDocuments) {
      try {
        setDocuments(JSON.parse(savedDocuments));
      } catch (error) {
        console.error('Failed to parse saved documents', error);
        localStorage.removeItem('documents');
      }
    }
  }, []);

  // Save documents to localStorage whenever they change
  useEffect(() => {
    if (documents.length > 0) {
      localStorage.setItem('documents', JSON.stringify(documents));
    }
  }, [documents]);

  /**
   * Upload a file for OCR processing
   */
  const uploadDocument = async (file) => {
    setUploadLoading(true);
    try {
      const response = await documentService.uploadDocument(file);
      
      const newDoc = {
        id: response.document_id,
        filename: response.filename,
        status: response.status,
        createdAt: new Date().toISOString(),
      };
      
      setDocuments(prev => [newDoc, ...prev]);
      toast.success('Document uploaded successfully');
      
      // Add a small delay before navigation
      setCurrentDocument(response);
      navigate(`/documents/${response.document_id}`);
      
      return response;
    } catch (error) {
      toast.error('Failed to upload document');
      throw error;
    } finally {
      setUploadLoading(false);
    }
  };

  /**
   * Process a document from URL
   */
  const processDocumentUrl = async (url) => {
    setLoading(true);
    try {
      const response = await documentService.processDocumentUrl(url);
      
      // Add to documents list
      const newDoc = {
        id: response.document_id,
        filename: response.filename || 'URL Document',
        status: response.status,
        createdAt: new Date().toISOString(),
        isUrl: true,
        url,
      };
      
      setDocuments(prev => [newDoc, ...prev]);
      toast.success('Document processing started');
      
      // Navigate to document view
      navigate(`/documents/${response.document_id}`);
      return response;
    } catch (error) {
      console.error('Error processing document URL:', error);
      toast.error('Failed to process document URL');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get document details
   */
  const getDocument = async (documentId) => {
    setLoading(true);
    try {
      const doc = await documentService.getDocument(documentId);
      setCurrentDocument(doc);
      return doc;
    } catch (error) {
      const message = error.message || 'Failed to fetch document';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Clear current document
   */
  const clearCurrentDocument = () => {
    setCurrentDocument(null);
  };

  /**
   * Remove a document from history
   */
  const removeDocument = (documentId) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    if (currentDocument?.document_id === documentId) {
      clearCurrentDocument();
    }
  };

  const value = {
    documents,
    currentDocument,
    loading,
    uploadLoading,
    uploadDocument,
    processDocumentUrl,
    getDocument,
    clearCurrentDocument,
    removeDocument
  };

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
}