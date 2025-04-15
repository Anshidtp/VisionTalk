import api from './api';

const chatService = {
  /**
   * Chat with a processed document
   * @param {string} documentId - Document ID
   * @param {string} query - User's query about the document
   * @returns {Promise} - Promise with the chat response
   */
  chatWithDocument: async (documentId, query) => {
    const response = await api.post(`/chat/${documentId}`, { query });
    return response.data;
  },

  /**
   * Get chat history for a document
   * @param {string} documentId - Document ID
   * @returns {Promise} - Promise with chat history
   */
  getChatHistory: async (documentId) => {
    const response = await api.get(`/chat/${documentId}/history`);
    return response.data;
  },
};

export default chatService;