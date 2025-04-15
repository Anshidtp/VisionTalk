import { useState } from 'react';
import { FaLink, FaSpinner } from 'react-icons/fa';
import { useDocument } from '@context/DocumentContext';

const UrlUpload = () => {
  const [url, setUrl] = useState('');
  const { processDocumentUrl, loading } = useDocument();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!url.trim()) return;
    
    try {
      await processDocumentUrl(url);
      setUrl(''); // Reset URL after processing
    } catch (error) {
      // Error is handled in the context
    }
  };

  return (
    <div className="card mt-6">
      <h2 className="text-xl font-semibold mb-4">Process Document from URL</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="document-url" className="block text-sm font-medium text-gray-700 mb-1">
            Document URL
          </label>
          <input
            id="document-url"
            type="url"
            placeholder="https://example.com/document.pdf"
            className="input"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter a direct URL to a PDF or image file
          </p>
        </div>
        
        <button
          type="submit"
          className="btn btn-primary w-full flex justify-center items-center"
          disabled={!url.trim() || loading}
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin mr-2" />
              Processing...
            </>
          ) : (
            <>
              <FaLink className="mr-2" />
              Process URL
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default UrlUpload;