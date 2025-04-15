import { useState, useEffect } from 'react';
import chatService from '@services/chatService';

export function useChat(documentId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  useEffect(() => {
    if (!documentId) return;
    
    const fetchChatHistory = async () => {
      setLoadingHistory(true);
      setError(null);
      
      try {
        const history = await chatService.getChatHistory(documentId);
        setMessages(history.messages || []);
      } catch (err) {
        console.error('Error fetching chat history:', err);
        setError('Failed to load chat history');
      } finally {
        setLoadingHistory(false);
      }
    };
    
    fetchChatHistory();
  }, [documentId]);
  
  const sendMessage = async (content) => {
    if (!content.trim() || loading) return;
    
    const userMessage = {
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setError(null);
    
    try {
      const response = await chatService.chatWithDocument(documentId, content);
      
      const assistantMessage = {
        role: 'assistant',
        content: response.answer,
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      return assistantMessage;
    } catch (err) {
      console.error('Error chatting with document:', err);
      setError('Failed to get response. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const clearMessages = () => {
    setMessages([]);
  };
  
  return {
    messages,
    loading,
    loadingHistory,
    error,
    sendMessage,
    clearMessages
  };
}