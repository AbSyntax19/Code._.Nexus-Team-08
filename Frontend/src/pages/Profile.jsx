import React, { useState } from "react";

export default function Profile() {
  const [extractedData, setExtractedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [message, setMessage] = useState("");

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      console.log("No file selected");
      return;
    }

    console.log("Selected file:", file.name, file.type, file.size);

    setFileName(file.name);
    setLoading(true);
    setMessage("Extracting student details using OCR... please wait ⏳");

    try {
      const formData = new FormData();
      formData.append("file", file);

      console.log("Sending request to:", `${import.meta.env.VITE_API_URL}/ocr`);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/ocr`, {
        method: "POST",
        body: formData,
      });

      console.log("Response status:", res.status);
      console.log("Response headers:", [...res.headers.entries()]);

      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch {
          errorData = { detail: `Server error: ${res.status} ${res.statusText}` };
        }
        console.error("Error response:", errorData);
        throw new Error(errorData.detail || `Server error: ${res.status}`);
      }

      const data = await res.json();
      console.log("Success response:", data);

      const extracted = data.extracted_data || {};

      setExtractedData(extracted);
      setMessage("✅ OCR extraction successful!");
    } catch (error) {
      console.error("Upload error:", error);
      setMessage(`❌ OCR failed: ${error.message}`);
      setExtractedData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!extractedData) return;
    setMessage("✅ Profile saved successfully!");
    console.log("Saved profile:", extractedData);
    alert("✅ Profile saved successfully!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-600 to-orange-500 p-4 md:p-8">
      {/* Animated background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-75"></div>
        <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-150"></div>
      </div>

      <div className="relative max-w-4xl mx-auto">
        {/* Header Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 mb-6 border border-white/20">
          <div className="flex items-center gap-4 mb-2">
            <div className="text-6xl animate-bounce">🎓</div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                Student Profile
              </h1>
              <p className="text-xl text-white/80 font-semibold">OCR Powered Magic ✨</p>
            </div>
          </div>
        </div>

        {/* Upload Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 mb-6 border-4 border-purple-400 transform hover:scale-[1.02] transition-all duration-300">
          <div className="relative">
            <label
              htmlFor="fileUpload"
              className="block text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4"
            >
              📤 Upload Student Document
            </label>
            <p className="text-gray-600 mb-4 font-medium">ID Card • Marksheet • Any Document</p>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
              <input
                id="fileUpload"
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                disabled={loading}
                className="relative block w-full text-base text-gray-700 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-base file:font-bold file:bg-gradient-to-r file:from-purple-500 file:to-pink-500 file:text-white hover:file:from-purple-600 hover:file:to-pink-600 file:cursor-pointer file:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed bg-white rounded-2xl p-4 cursor-pointer border-2 border-dashed border-purple-300 hover:border-purple-500 transition-all"
              />
            </div>

            {fileName && (
              <div className="mt-4 p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl border-2 border-purple-300 animate-fadeIn">
                <p className="text-base font-bold text-purple-900 flex items-center gap-2">
                  📄 {fileName}
                </p>
              </div>
            )}

            {message && (
              <div className={`mt-4 p-4 rounded-xl border-2 font-bold text-base animate-fadeIn ${message.includes("✅")
                  ? "bg-green-100 border-green-400 text-green-800"
                  : message.includes("❌")
                    ? "bg-red-100 border-red-400 text-red-800"
                    : "bg-blue-100 border-blue-400 text-blue-800"
                }`}>
                {message}
              </div>
            )}

            {loading && (
              <div className="mt-6 flex items-center justify-center gap-3 p-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl">
                <div className="relative w-8 h-8">
                  <div className="absolute inset-0 rounded-full border-4 border-purple-200"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-purple-600 border-t-transparent animate-spin"></div>
                </div>
                <span className="text-lg font-bold text-purple-900">Processing your document...</span>
              </div>
            )}
          </div>
        </div>

        {/* Display Extracted Data */}
        {extractedData && (
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border-4 border-orange-400 animate-fadeIn transform hover:scale-[1.01] transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">🧾</span>
              <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-pink-600">
                Extracted Details
              </h3>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-2xl overflow-hidden shadow-lg border-2 border-orange-200">
              <table className="w-full">
                <tbody className="divide-y divide-orange-200">
                  {Object.entries(extractedData).map(([key, value], index) => (
                    <tr
                      key={key}
                      className="hover:bg-white/50 transition-colors"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="py-4 px-6 font-black text-purple-700 uppercase text-sm tracking-wider w-1/3 bg-gradient-to-r from-purple-100/50 to-transparent">
                        {key}
                      </td>
                      <td className="py-4 px-6 text-gray-900 font-semibold text-base">
                        {value || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={handleSave}
              className="mt-8 w-full relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 text-white font-black text-xl py-4 px-8 rounded-2xl shadow-xl transform group-hover:scale-105 transition-all duration-300">
                ✅ Confirm & Save Profile
              </div>
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}