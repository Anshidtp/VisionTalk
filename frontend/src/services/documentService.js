import api from './api';

const documentService = {
  /**
   * Upload a document (PDF or image) for processing
   * @param {File} file - The file to upload
   * @returns {Promise} - Promise with the upload result
   */
  uploadDocument: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Process a document from a URL
   * @param {string} url - URL of the document to process
   * @returns {Promise} - Promise with the processing result
   */
  processDocumentUrl: async (url) => {
    const response = await api.post('/documents/process-url', { url });
    return response.data;
  },

  /**
   * Get document details including OCR results
   * @param {string} documentId - Document ID
   * @returns {Promise} - Promise with document details
   */
  getDocument: async (documentId) => {
    const response = await api.get(`/documents/${documentId}`);
    return response.data;
  },
};

export default documentService;