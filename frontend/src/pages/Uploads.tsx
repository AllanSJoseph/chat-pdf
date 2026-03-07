import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { pdfAPI } from "../api";
import { Trash2, Play, ArrowLeft, Loader } from "lucide-react";

interface PDFUpload {
  pdf_id: string;
  filename: string;
  status: string;
  uploaded_at: string;
}

const Uploads = () => {
  const [uploads, setUploads] = useState<PDFUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchUploads = async () => {
    try {
      setLoading(true);
      const res = await pdfAPI.getUploads();
      setUploads(res.data.uploads || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch uploads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUploads();
  }, []);

  const handleDelete = async (pdfId: string) => {
    if (!window.confirm("Are you sure you want to delete this PDF and its chats?")) return;
    try {
      await pdfAPI.deleteUpload(pdfId);
      // Remove from state
      setUploads((prev) => prev.filter((u) => u.pdf_id !== pdfId));
    } catch (err: any) {
      alert("Failed to delete PDF: " + err.message);
    }
  };

  const handleProcess = async (pdfId: string) => {
    try {
      // Optimistically update status
      setUploads((prev) =>
        prev.map((u) => (u.pdf_id === pdfId ? { ...u, status: "Processing" } : u))
      );
      await pdfAPI.process(pdfId);
      // Refetch to get actual ready status
      fetchUploads();
    } catch (err: any) {
      alert("Failed to process PDF: " + err.message);
      // Refetch to revert to original status
      fetchUploads();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/")}
              className="p-2 bg-white text-gray-600 rounded-lg hover:bg-gray-100 transition-colors shadow-sm"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-3xl font-bold text-gray-800">Your Uploads</h1>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6 shadow-sm border border-red-100">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : uploads.length === 0 ? (
            <div className="text-center p-12 text-gray-500">
              <p className="text-lg">No PDFs uploaded yet.</p>
              <button
                onClick={() => navigate("/")}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium underline"
              >
                Go back to chat to upload one.
              </button>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Filename
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Upload Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {uploads.map((upload) => (
                  <tr key={upload.pdf_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                        {upload.filename}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(upload.uploaded_at).toLocaleDateString()}{" "}
                        {new Date(upload.uploaded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          upload.status === "Ready"
                            ? "bg-green-100 text-green-800"
                            : upload.status === "Processing"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {upload.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        {upload.status === "Uploaded" && (
                          <button
                            onClick={() => handleProcess(upload.pdf_id)}
                            className="text-blue-600 hover:text-blue-900 transition-colors flex items-center"
                            title="Start Processing"
                          >
                            <Play className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(upload.pdf_id)}
                          className="text-red-500 hover:text-red-700 transition-colors flex items-center"
                          title="Delete PDF"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Uploads;
