import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants';

const SessionTimeoutModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleSessionExpired = () => setIsOpen(true);
    window.addEventListener('session-expired', handleSessionExpired);
    
    return () => {
      window.removeEventListener('session-expired', handleSessionExpired);
    };
  }, []);

  const handleLoginRedirect = () => {
    // Clear tokens here to ensure clean state
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);
    setIsOpen(false);
    navigate('/login', { replace: true });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center animate-in fade-in zoom-in duration-200">
        <div className="mx-auto w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-4">
          <AlertCircle size={24} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Session Expired</h2>
        <p className="text-gray-500 mb-6 text-sm">
          Your session has timed out due to security reasons. Please log in again to continue.
        </p>
        <button
          onClick={handleLoginRedirect}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg transition duration-200 font-medium"
        >
          Return to Login
        </button>
      </div>
    </div>
  );
};

export default SessionTimeoutModal;
