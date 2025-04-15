import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaSpinner, FaUser, FaRobot, FaFilePdf, FaPaperPlane } from 'react-icons/fa';
import { useDocument } from '@context/DocumentContext';
import chatService from '@services/chatService';
import ReactMarkdown from 'react-markdown';

const Chat = () => {
  const { documentId } = useParams();
  const { getDocument, currentDocument, loading } = useDocument();
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const messagesEndRef = useRef(null);
  
  useEffect(() => {
    const fetchDocument = async () => {
      try {
        await getDocument(documentId);
      } catch (error) {
        // Error handled in context
      }
    };
    
    fetchDocument();
  }, [documentId, getDocument]);
  
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (currentDocument?.status !== 'completed') return;
      
      setLoadingHistory(true);
      try {
        const history = await chatService.getChatHistory(documentId);
        setMessages(history.messages || []);
      } catch (error) {
        console.error('Error fetching chat history:', error);
      } finally {
        setLoadingHistory(false);
      }
    };
    
    fetchChatHistory();
  }, [documentId, currentDocument]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!query.trim() || chatLoading) return;
    
    const userMessage = {
      role: 'user',
      content: query,
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setQuery('');
    setChatLoading(true);
    setChatError(null);
    
    try {
      const response = await chatService.chatWithDocument(documentId, query);
      
      const assistantMessage = {
        role: 'assistant',
        content: response.answer,
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error chatting with document:', error);
      setChatError('Failed to get response. Please try again.');
    } finally {
      setChatLoading(false);
    }
  };
  
  if (loading || loadingHistory) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <FaSpinner className="text-4xl text-primary-600 animate-spin mb-4" />
        <p className="text-gray-600">Loading chat...</p>
      </div>
    );
  }
  
  if (!currentDocument) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Document Not Found</h2>
        <p className="text-gray-600 mb-6">
          The document you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/" className="btn btn-primary">
          Back to Home
        </Link>
      </div>
    );
  }
  
  if (currentDocument.status !== 'completed') {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Document Not Ready</h2>
        <p className="text-gray-600 mb-6">
          This document is still being processed or processing has failed.
        </p>
        <Link to={`/documents/${documentId}`} className="btn btn-primary">
          Check Status
        </Link>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4 flex items-center">
        <FaFilePdf className="text-gray-500 mr-3" />
        <div>
          <h1 className="font-medium">{currentDocument.filename}</h1>
          <Link to={`/documents/${documentId}`} className="text-sm text-primary-600 hover:text-primary-700">
            View Document Details
          </Link>
        </div>
      </div>
      
      <div className="flex-grow bg-white rounded-lg shadow-sm mb-4 overflow-hidden flex flex-col">
        <div className="flex-grow overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <FaRobot className="text-4xl text-gray-300 mb-3" />
              <h2 className="font-medium text-xl mb-2">Ask about this document</h2>
              <p className="text-gray-500 max-w-lg">
                Start chatting to ask questions about the document's content, summarize sections,
                or request specific information.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === 'user' 
                        ? 'bg-primary-600 text-white' 
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      {message.role === 'user' ? (
                        <>
                          <span className="font-medium">You</span>
                          <FaUser className="ml-2 text-xs" />
                        </>
                      ) : (
                        <>
                          <span className="font-medium">AI Assistant</span>
                          <FaRobot className="ml-2 text-xs" />
                        </>
                      )}
                    </div>
                    
                    {message.role === 'assistant' ? (
                      <div className="markdown-content">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p>{message.content}</p>
                    )}
                    
                    <div className="text-xs opacity-70 mt-2 text-right">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg p-4 bg-gray-100">
                    <div className="flex items-center">
                      <span className="font-medium">AI Assistant</span>
                      <FaRobot className="ml-2 text-xs" />
                    </div>
                    <div className="flex items-center mt-2">
                      <FaSpinner className="animate-spin text-gray-500" />
                      <span className="ml-2 text-gray-500">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              {chatError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800">{chatError}</p>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        <div className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex space-x-3">
            <input
              type="text"
              className="input flex-grow"
              placeholder="Ask a question about the document..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={chatLoading}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!query.trim() || chatLoading}
            >
              {chatLoading ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <FaPaperPlane />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;