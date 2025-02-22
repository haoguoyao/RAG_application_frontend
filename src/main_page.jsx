import { useState } from "react";
import { UploadCloud, Search } from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function RAGApp() {
  const [file, setFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("semantic");
  const [results, setResults] = useState([]);
  const [streaming, setStreaming] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");

  const handleFileUpload = async (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      await uploadFile(uploadedFile);
    }
  };

  const uploadFile = async (file) => {
    setUploading(true);
    setUploadStatus("Uploading...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${BACKEND_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      setUploadStatus("File uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setStreaming(true);
    setResults([]);

    try {
      const response = await fetch(`${BACKEND_URL}/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: searchQuery,
          searchType: searchType,
        }),
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data = await response.json();
      setResults([data.result]);
    } catch (error) {
      console.error("Search error:", error);
      setResults([`Error: ${error.message}`]);
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <div className="max-w-3xl w-full">
        <h1 className="text-2xl font-bold text-center mb-4">Retrieval Augmented Generation</h1>
        
        <div className="p-4 mb-4 bg-white shadow rounded-lg">
          <label className="font-medium">Upload Document (PDF or HTML)</label>
          <input 
            type="file" 
            accept=".pdf,.html" 
            onChange={handleFileUpload} 
            className="hidden" 
            id="fileUpload"
            disabled={uploading} 
          />
          <label 
            htmlFor="fileUpload" 
            className={`cursor-pointer flex items-center gap-2 p-2 ${
              uploading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
            } text-white rounded-lg w-fit transition-colors`}
          >
            <UploadCloud className="w-5 h-5" />
            {uploading ? 'Uploading...' : 'Upload File'}
          </label>
          {uploadStatus && (
            <p className={`text-sm mt-2 ${
              uploadStatus.includes('failed') ? 'text-red-500' : 'text-green-600'
            }`}>
              {uploadStatus}
            </p>
          )}
          {file && <p className="text-sm text-gray-600 mt-2">Selected file: {file.name}</p>}
        </div>
        
        <div className="p-4 mb-4 bg-white shadow rounded-lg">
          <div className="flex justify-between items-center">
            <label className="font-medium">Search Type</label>
            <div className="flex items-center gap-2">
              <span className="text-sm">Keyword</span>
              <button 
                onClick={() => setSearchType(searchType === "semantic" ? "keyword" : "semantic")} 
                className="p-1 bg-gray-300 rounded-full w-10"
              >
                <div className={`w-4 h-4 bg-white rounded-full transform transition-transform ${
                  searchType === "semantic" ? "translate-x-5" : "translate-x-0"
                }`}></div>
              </button>
              <span className="text-sm">Semantic</span>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <input 
              type="text" 
              placeholder="Enter your query..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="border px-3 py-2 rounded-md flex-grow focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <button 
              onClick={handleSearch} 
              disabled={streaming || !searchQuery.trim()}
              className={`${
                streaming || !searchQuery.trim() ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
              } text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors`}
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 bg-white shadow rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Search Results</h2>
          <div className="bg-gray-100 p-4 rounded-lg min-h-[100px]">
            {results.length === 0 && !streaming ? (
              <p className="text-gray-500">No results yet.</p>
            ) : (
              results.map((result, index) => (
                <p key={index} className="text-gray-700 whitespace-pre-wrap">{result}</p>
              ))
            )}
            {streaming && <p className="text-blue-500">Loading...</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
