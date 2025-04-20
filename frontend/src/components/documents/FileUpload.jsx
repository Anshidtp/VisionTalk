import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaUpload, FaSpinner, FaFilePdf, FaFileImage } from 'react-icons/fa';
import { useDocument } from '@context/DocumentContext';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const { uploadDocument, uploadLoading } = useDocument();

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles?.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxFiles: 1,
    multiple: false,
  });

  const handleUpload = async () => {
    if (!file) return;
    
    try {
      await uploadDocument(file);
      setFile(null); // Reset file after successful upload
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const getFileIcon = () => {
    if (!file) return null;
    
    const fileType = file.type;
    if (fileType === 'application/pdf') {
      return <FaFilePdf className="text-red-500 text-2xl" />;
    } else if (fileType.startsWith('image/')) {
      return <FaFileImage className="text-blue-500 text-2xl" />;
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Upload Document</h2>
      
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-8 mb-4 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary-400 bg-primary-50' : 'border-gray-300 hover:border-primary-400'
        }`}
      >
        <input {...getInputProps()} />
        <FaUpload className="mx-auto text-3xl text-gray-400 mb-2" />
        {isDragActive ? (
          <p className="text-primary-600">Drop the file here...</p>
        ) : (
          <div>
            <p className="font-medium mb-1">Drag & drop a file here, or click to select</p>
            <p className="text-sm text-gray-500">Support PDF, JPG, PNG (Max 10MB)</p>
          </div>
        )}
      </div>
      
      {file && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg flex items-center">
          {getFileIcon()}
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium truncate">{file.name}</p>
            <p className="text-xs text-gray-500">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>
      )}

      <button
        className="btn btn-primary w-full flex justify-center items-center"
        onClick={handleUpload}
        disabled={!file || uploadLoading}
      >
        {uploadLoading ? (
          <>
            <FaSpinner className="animate-spin mr-2" />
            Uploading...
          </>
        ) : (
          <>
            <FaUpload className="mr-2" />
            Upload Document
          </>
        )}
      </button>
    </div>
  );
};

export default FileUpload;