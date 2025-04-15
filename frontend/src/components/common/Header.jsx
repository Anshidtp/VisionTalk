import { Link } from 'react-router-dom';
import { FaFileAlt, FaHistory } from 'react-icons/fa';
import { useState } from 'react';
import { useDocument } from '@context/DocumentContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { documents } = useDocument();
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <FaFileAlt className="text-primary-600 text-2xl" />
            <span className="text-xl font-bold text-primary-700">DocuChat</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-primary-600">
              Home
            </Link>
            <div className="relative group">
              <button className="flex items-center text-gray-700 hover:text-primary-600">
                <FaHistory className="mr-1" />
                Recent Documents ({documents.length})
              </button>
              
              {documents.length > 0 && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 hidden group-hover:block z-10">
                  <div className="p-2 max-h-96 overflow-y-auto">
                    {documents.map(doc => (
                      <Link
                        key={doc.id}
                        to={`/documents/${doc.id}`}
                        className="block p-2 hover:bg-gray-100 rounded"
                      >
                        <div className="flex items-start">
                          <FaFileAlt className="mt-1 mr-2 text-gray-400" />
                          <div>
                            <p className="font-medium text-sm truncate">{doc.filename}</p>
                            <div className="flex items-center text-xs text-gray-500">
                              <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
                                doc.status === 'completed' ? 'bg-green-500' : 
                                doc.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                              }`}></span>
                              <span>{doc.status}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Mobile menu button */}
          <button 
            onClick={toggleMenu}
            className="md:hidden text-gray-700 hover:text-primary-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 space-y-2">
            <Link to="/" className="block py-2 text-gray-700 hover:text-primary-600">
              Home
            </Link>
            <div className="py-2">
              <p className="text-gray-700 mb-2">Recent Documents</p>
              <div className="pl-4 space-y-2 max-h-60 overflow-y-auto">
                {documents.length > 0 ? documents.map(doc => (
                  <Link
                    key={doc.id}
                    to={`/documents/${doc.id}`}
                    className="block py-1 text-gray-600 hover:text-primary-600"
                  >
                    <div className="flex items-center">
                      <FaFileAlt className="mr-2 text-gray-400" />
                      <span className="truncate">{doc.filename}</span>
                    </div>
                  </Link>
                )) : (
                  <p className="text-sm text-gray-500">No recent documents</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;