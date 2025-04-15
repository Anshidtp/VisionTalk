import { FaFileAlt, FaComments } from 'react-icons/fa';
import FileUpload from '@components/documents/FileUpload';
import UrlUpload from '@components/documents/UrlUpload';
import { useDocument } from '@context/DocumentContext';
import { Link } from 'react-router-dom';

const Home = () => {
  const { documents } = useDocument();
  
  const recentDocuments = documents.slice(0, 5); // Get latest 5 documents
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <section className="mb-10">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Document OCR & Chat</h1>
          <p className="text-lg text-gray-600">
            Upload your documents and ask questions about them. Our AI will extract text and help you analyze the content.
          </p>
        </section>
        
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="bg-primary-100 text-primary-700 w-10 h-10 rounded-full flex items-center justify-center mb-3">
                1
              </div>
              <h3 className="font-medium mb-2">Upload Document</h3>
              <p className="text-sm text-gray-600">Upload a PDF or image to extract text using OCR</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="bg-primary-100 text-primary-700 w-10 h-10 rounded-full flex items-center justify-center mb-3">
                2
              </div>
              <h3 className="font-medium mb-2">Review Content</h3>
              <p className="text-sm text-gray-600">Check the extracted text and verify accuracy</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="bg-primary-100 text-primary-700 w-10 h-10 rounded-full flex items-center justify-center mb-3">
                3
              </div>
              <h3 className="font-medium mb-2">Chat and Ask</h3>
              <p className="text-sm text-gray-600">Ask questions about the document content</p>
            </div>
          </div>
        </div>
        
        <FileUpload />
        <UrlUpload />
      </div>
      
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Documents</h2>
            {documents.length > 5 && (
              <Link to="/documents" className="text-sm text-primary-600 hover:text-primary-700">
                View all
              </Link>
            )}
          </div>
          
          {recentDocuments.length > 0 ? (
            <div className="space-y-3">
              {recentDocuments.map(doc => (
                <Link 
                  key={doc.id} 
                  to={`/documents/${doc.id}`}
                  className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-start">
                    <FaFileAlt className="text-gray-400 mt-1" />
                    <div className="ml-3">
                      <h3 className="font-medium text-sm">{doc.filename}</h3>
                      <div className="flex items-center mt-1">
                        <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
                          doc.status === 'completed' ? 'bg-green-500' : 
                          doc.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                        }`}></span>
                        <span className="text-xs text-gray-500 mr-3">{doc.status}</span>
                        <span className="text-xs text-gray-400">
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FaFileAlt className="mx-auto text-gray-300 text-4xl mb-3" />
              <p className="text-gray-500">No documents yet</p>
              <p className="text-sm text-gray-400 mt-2">
                Upload your first document to get started
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;