import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaSpinner, FaComments, FaDownload, FaEye, FaTrash } from 'react-icons/fa';
import { useDocument } from '@context/DocumentContext';

const DocumentView = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const { getDocument, currentDocument, loading, removeDocument } = useDocument();
  const [activeTab, setActiveTab] = useState('text');
  
  useEffect(() => {
    // Only fetch if we don't have the document or it's a different one
    if (!currentDocument || currentDocument.id !== documentId) {
      getDocument(documentId);
    }
  }, [documentId]);
  
  const handleChatWithDocument = () => {
    navigate(`/chat/${documentId}`);
  };
  
  const handleDeleteDocument = () => {
    if (window.confirm('Are you sure you want to remove this document from your history?')) {
      removeDocument(documentId);
      navigate('/');
    }
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <FaSpinner className="text-4xl text-primary-600 animate-spin mb-4" />
        <p className="text-gray-600">Loading document...</p>
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
  
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {currentDocument.filename}
          </h1>
          <div className="flex items-center">
            <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
              currentDocument.status === 'completed' ? 'bg-green-500' : 
              currentDocument.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
            }`}></span>
            <span className="text-sm text-gray-600 capitalize mr-4">
              {currentDocument.status}
            </span>
            <span className="text-sm text-gray-500">
              Processed on {new Date(currentDocument.processed_date || currentDocument.createdAt).toLocaleString()}
            </span>
          </div>
        </div>
        
        <div className="flex mt-4 md:mt-0 space-x-3">
          <button
            onClick={handleChatWithDocument}
            disabled={currentDocument.status !== 'completed'}
            className={`btn ${
              currentDocument.status === 'completed' 
                ? 'btn-primary' 
                : 'bg-gray-300 text-gray-600 cursor-not-allowed'
            } flex items-center`}
          >
            <FaComments className="mr-2" />
            Chat with Document
          </button>
          
          <button
            onClick={handleDeleteDocument}
            className="btn btn-outline flex items-center text-red-600 border-red-600 hover:bg-red-50"
          >
            <FaTrash className="mr-2" />
            Remove
          </button>
        </div>
      </div>
      
      {currentDocument.status === 'processing' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 flex items-center">
            <FaSpinner className="animate-spin mr-2" />
            Your document is being processed. This may take a few moments...
          </p>
        </div>
      )}
      
      {currentDocument.status === 'failed' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">
            Processing failed: {currentDocument.error || 'An unknown error occurred'}
          </p>
        </div>
      )}
      
      {currentDocument.status === 'completed' && (
        <>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
            <div className="flex border-b">
              <button
                className={`px-6 py-3 font-medium text-sm ${
                  activeTab === 'text' 
                    ? 'text-primary-600 border-b-2 border-primary-600' 
                    : 'text-gray-600 hover:text-primary-600'
                }`}
                onClick={() => setActiveTab('text')}
              >
                Extracted Text
              </button>
              <button
                className={`px-6 py-3 font-medium text-sm ${
                  activeTab === 'preview' 
                    ? 'text-primary-600 border-b-2 border-primary-600' 
                    : 'text-gray-600 hover:text-primary-600'
                }`}
                onClick={() => setActiveTab('preview')}
              >
                Document Preview
              </button>
            </div>
            
            <div className="p-6">
              {activeTab === 'text' && (
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm">
                    {currentDocument.extracted_text}
                  </pre>
                </div>
              )}
              
              {activeTab === 'preview' && (
                <div className="flex justify-center">
                  {currentDocument.preview_url ? (
                    <img 
                      src={currentDocument.preview_url} 
                      alt="Document Preview" 
                      className="max-w-full max-h-[800px] object-contain" 
                    />
                  ) : (
                    <div className="text-center py-16">
                      <FaEye className="text-4xl text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No preview available</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-3">Document Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">File Name</h3>
                <p>{currentDocument.filename}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Document ID</h3>
                <p className="font-mono text-sm">{currentDocument.document_id}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Page Count</h3>
                <p>{currentDocument.page_count || 'N/A'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Character Count</h3>
                <p>{currentDocument.extracted_text?.length.toLocaleString() || 'N/A'}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DocumentView;