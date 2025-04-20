import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context Providers
import { DocumentProvider } from '@context/DocumentContext';

// Pages
import Home from '@pages/Home';
import DocumentView from '@pages/DocumentView';
import Chat from '@pages/Chat';
import NotFound from '@pages/NotFound';

// Components
import Header from '@components/common/Header';
import Footer from '@components/common/Footer';

function App() {
  return (
    <Router>
      <DocumentProvider>
        <div className="flex flex-col min-h-screen bg-gray-50">
          <Header />
          <main className="flex-grow container mx-auto px-4 py-6">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/documents/:documentId" element={<DocumentView />} />
              <Route path="/chat/:documentId" element={<Chat />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
        <ToastContainer position="top-right" autoClose={5000} />
      </DocumentProvider>
    </Router>
  );
}

export default App;