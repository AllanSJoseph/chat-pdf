import React, { useEffect, useState } from 'react';
import { X, FileText, Loader } from 'lucide-react';
import { pdfAPI } from '../api';

interface UploadedPDF {
  pdf_id: string;
  filename: string;
  status: string;
  uploaded_at: string;
}

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPdf: (pdfId: string) => void;
}

const NewChatModal: React.FC<NewChatModalProps> = ({ isOpen, onClose, onSelectPdf }) => {
  const [uploads, setUploads] = useState<UploadedPDF[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchUploads();
    }
  }, [isOpen]);

  const fetchUploads = async () => {
    setLoading(true);
    try {
      const res = await pdfAPI.getUploads();
      // Show Ready PDFs so users can chat with them
      setUploads(res.data.uploads.filter((p: UploadedPDF) => p.status === 'Ready'));
    } catch (error) {
      console.error("Failed to fetch uploads:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">New Chat</h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Loader className="animate-spin mb-4" size={32} />
              <p>Loading PDFs...</p>
            </div>
          ) : uploads.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="font-medium text-gray-900 mb-1">No PDFs available</p>
              <p className="text-sm">Upload a PDF first to start chatting.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {uploads.map((pdf) => (
                <button
                  key={pdf.pdf_id}
                  onClick={() => onSelectPdf(pdf.pdf_id)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all text-left group"
                >
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileText size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{pdf.filename}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(pdf.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewChatModal;
