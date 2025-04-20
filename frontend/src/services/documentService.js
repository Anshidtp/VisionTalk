import api from './api';

const documentService = {
  /**
   * Upload a document (PDF or image) for processing
   * @param {File} file - The file to upload
   * @returns {Promise} - Promise with the upload result
   */
  uploadDocument: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/api/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 second timeout for large files
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log('Upload progress:', percentCompleted);
        },
      });
      return response.data;
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error(error.response?.data?.detail || 'Failed to upload document');
    }
  },

  /**
   * Process a document from a URL
   * @param {string} url - URL of the document to process
   * @returns {Promise} - Promise with the processing result
   */
  processDocumentUrl: async (url) => {
    try {
      const response = await api.post('/api/documents/process-url', { url });
      return response.data;
    } catch (error) {
      console.error('Process URL error:', error);
      throw new Error(error.response?.data?.detail || 'Failed to process document URL');
    }
  },

  /**
   * Get document details including OCR results
   * @param {string} documentId - Document ID
   * @returns {Promise} - Promise with document details
   */
  getDocument: async (documentId) => {
    if (documentCache.has(documentId)) {
      console.log('Cache hit for document:', documentId);
      return documentCache.get(documentId);
    }
    try {
      const response = await api.get(`/api/documents/${documentId}`);
      console.log('Caching document:', documentId);
      documentCache.set(documentId, response.data);
      return response.data;
    } catch (error) {
      console.error('Get document error:', error);
      if (error.response?.status === 404) {
        throw new Error('Document not found');
      }
      throw new Error(error.response?.data?.detail || 'Failed to fetch document');
    }
  },

  // Add method to clear cache when needed
  clearCache: (documentId) => {
    if (documentId) {
      documentCache.delete(documentId);
    } else {
      documentCache.clear();
    }
  },

  /**
   * Delete a document
   * @param {string} documentId - Document ID to delete
   * @returns {Promise} - Promise with deletion result
   */
  deleteDocument: async (documentId) => {
    try {
      const response = await api.delete(`/api/documents/${documentId}`);
      return response.data;
    } catch (error) {
      console.error('Delete document error:', error);
      throw new Error(error.response?.data?.detail || 'Failed to delete document');
    }
  }
};

export default documentService;