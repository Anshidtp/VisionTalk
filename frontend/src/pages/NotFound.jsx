import { Link } from 'react-router-dom';
import { FaExclamationTriangle } from 'react-icons/fa';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <FaExclamationTriangle className="text-5xl text-yellow-500 mb-4" />
      <h1 className="text-3xl font-bold text-gray-800 mb-3">Page Not Found</h1>
      <p className="text-lg text-gray-600 mb-8 max-w-md">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link to="/" className="btn btn-primary">
        Back to Home
      </Link>
    </div>
  );
};

export default NotFound;