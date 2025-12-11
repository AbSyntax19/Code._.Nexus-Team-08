import React, { useState } from "react";

export default function Recommendation() {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [profile, setProfile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [message, setMessage] = useState("");

  const handleFileUpload = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setMessage("");
    }
  };

  const handleExtract = async () => {
    if (!file) {
      setMessage("Please select a file first.");
      return;
    }

    setLoading(true);
    setMessage("Extracting details...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/ocr`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data = await res.json();
      if (!data.extracted_data) throw new Error("No OCR data found");

      const extracted = data.extracted_data;
      setProfile({
        name: extracted.name || "",
        dob: extracted.dob || "",
        college: extracted.college || "",
        course: extracted.course || "",
        cgpa: parseFloat(extracted.cgpa) || 0,
        loanAmount: parseInt(extracted.loanAmount) || 0,
        familyIncome: parseInt(extracted.familyIncome) || 0,
      });
      setMessage("Extraction successful.");
    } catch (err) {
      console.error(err);
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getRecommendations = async () => {
    if (!profile) return;

    setLoading(true);
    setMessage("Analyzing profile...");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (!res.ok) throw new Error("Failed to fetch recommendations");

      const data = await res.json();
      setRecommendations(data.recommendations || []);
      setMessage("Recommendations generated.");
    } catch (err) {
      console.error(err);
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProfile((prev) => ({
      ...prev,
      [field]: field === "cgpa" ? parseFloat(value) || 0 : field === "loanAmount" || field === "familyIncome" ? parseInt(value) || 0 : value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Loan Recommendation</h1>
          <p className="mt-2 text-gray-600">Upload your documents to get personalized education loan options.</p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-gray-400 transition-colors">
            <input
              type="file"
              onChange={handleFileUpload}
              accept=".pdf,.png,.jpg,.jpeg"
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <span className="mt-2 block text-sm font-medium text-gray-900">
                {fileName || "Select a file to upload"}
              </span>
              <span className="mt-1 block text-xs text-gray-500">PDF, PNG, JPG up to 10MB</span>
            </label>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className={`text-sm font-medium ${message.includes("Error") ? "text-red-600" : "text-green-600"}`}>
              {message}
            </p>
            <button
              onClick={handleExtract}
              disabled={!file || loading}
              className="w-full sm:w-auto px-6 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Processing..." : "Extract Data"}
            </button>
          </div>
        </div>

        {/* Profile Form */}
        {profile && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 animate-fade-in">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Student Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {["name", "dob", "college", "course"].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 capitalize mb-1">{field}</label>
                  <input
                    type="text"
                    value={profile[field]}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-shadow"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CGPA</label>
                <input
                  type="number"
                  step="0.1"
                  value={profile.cgpa}
                  onChange={(e) => handleInputChange("cgpa", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-shadow"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loan Amount (₹)</label>
                <input
                  type="number"
                  value={profile.loanAmount}
                  onChange={(e) => handleInputChange("loanAmount", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-shadow"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Family Income (₹)</label>
                <input
                  type="number"
                  value={profile.familyIncome}
                  onChange={(e) => handleInputChange("familyIncome", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-shadow"
                />
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <button
                onClick={getRecommendations}
                disabled={loading}
                className="px-6 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
              >
                Get Recommendations
              </button>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {recommendations && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-semibold text-gray-900">Recommended Loans</h2>
            <div className="grid grid-cols-1 gap-6">
              {recommendations.map((rec, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{rec.bank}</h3>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {rec.score}% Match
                        </span>
                      </div>
                    </div>
                    <button className="text-sm font-medium text-black hover:underline">
                      Apply Now &rarr;
                    </button>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">{rec.match_reason}</p>

                  <div className="border-t border-gray-100 pt-4">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Key Features</h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {rec.key_features.map((feature, idx) => (
                        <li key={idx} className="flex items-center text-sm text-gray-700">
                          <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}