import React, { useState, useEffect } from "react";
import { Upload, ChevronRight, Star, CheckCircle2, Circle, MapPin, Navigation } from "lucide-react";
import Map, { Marker, Popup, NavigationControl } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

interface LoanProduct {
    bank: string;
    interest_rate: string;
    loan_amount: string;
    collateral: string;
    documents: string[];
    credit_score: string;
    repayment: string;
    special?: string | null;
}

interface Recommendation {
    bank: string;
    match_reason: string;
    score: number;
    key_features: string[];
    link?: string;
}

interface Profile {
    name: string;
    dob: string;
    college: string;
    course: string;
    cgpa: string;
    loanAmount: string;
    familyIncome: string;
    [key: string]: string;
}

interface BankLocation {
    id: string;
    name: string;
    bankName: string;
    latitude: number;
    longitude: number;
    address: string;
}

const STEPS = [
    "Analyzing Profile",
    "Verifying Financial Data",
    "Searching Loan Database",
    "Computing Best Matches",
    "Finalizing Recommendations"
];

const DonutProgress = ({ progress }: { progress: number }) => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative w-40 h-40 mx-auto">
            {/* Background Circle */}
            <svg className="w-full h-full transform -rotate-90">
                <circle
                    className="text-slate-800"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="80"
                    cy="80"
                />
                {/* Foreground Circle */}
                <circle
                    className="text-indigo-500 transition-all duration-300 ease-out"
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="80"
                    cy="80"
                />
            </svg>
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">{Math.round(progress)}%</span>
            </div>
        </div>
    );
};

export default function Loans() {
    const [loanProducts, setLoanProducts] = useState<LoanProduct[]>([]);
    const [showRecommendationForm, setShowRecommendationForm] = useState(false);
    const [inputMethod, setInputMethod] = useState("manual");
    const [recommendations, setRecommendations] = useState<Recommendation[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingStep, setLoadingStep] = useState(0); 
    const [file, setFile] = useState<File | null>(null);
    const [profile, setProfile] = useState<Profile>({
        name: "",
        dob: "",
        college: "",
        course: "",
        cgpa: "",
        loanAmount: "",
        familyIncome: "",
    });
    const [fileName, setFileName] = useState("");
    const [message, setMessage] = useState("");

    // Map States
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [bankLocations, setBankLocations] = useState<BankLocation[]>([]);
    const [selectedBank, setSelectedBank] = useState<BankLocation | null>(null);
    const [mapLoading, setMapLoading] = useState(false);

    // Fetch available loan products on mount
    useEffect(() => {
        fetchLoanProducts();
        
        // Get user location
        if (navigator.geolocation) {
           navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setUserLocation({
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude
                    });
                }, 
                (err) => console.error("Location error:", err)
           );
        }
    }, []);

    // Progress simulation
    useEffect(() => {
        if (loading && loadingStep < STEPS.length) {
            const timer = setInterval(() => {
                setLoadingStep(prev => {
                    if (prev < STEPS.length - 1) return prev + 1;
                    return prev;
                });
            }, 800); // Advance step every 800ms
            return () => clearInterval(timer);
        }
    }, [loading, loadingStep]);

    const fetchLoanProducts = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/loans`);
            if (!res.ok) throw new Error("Failed to fetch loan products");
            const data = await res.json();
            setLoanProducts(data.loans || []);
        } catch (err: unknown) {
            console.error("Error fetching loan products:", err);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0];
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
        setLoadingStep(0);
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
                cgpa: extracted.cgpa ? String(extracted.cgpa) : "",
                loanAmount: extracted.loanAmount ? String(extracted.loanAmount) : "",
                familyIncome: extracted.familyIncome ? String(extracted.familyIncome) : "",
            });
            setMessage("Extraction successful.");
        } catch (err: unknown) {
            console.error(err);
            if (err instanceof Error) {
                setMessage(`Error: ${err.message}`);
            } else {
                setMessage("An unknown error occurred during extraction.");
            }
        } finally {
            setLoading(false);
            setLoadingStep(0);
        }
    };

    const getRecommendations = async () => {
        if (!profile.name) {
            setMessage("Please fill in the profile details.");
            return;
        }

        setLoading(true);
        setLoadingStep(0);
        setMessage("");

        try {
            const start = Date.now();
            
            const payload = {
                ...profile,
                cgpa: parseFloat(profile.cgpa) || 0,
                loanAmount: parseInt(profile.loanAmount) || 0,
                familyIncome: parseInt(profile.familyIncome) || 0,
            };

            const res = await fetch(`${import.meta.env.VITE_API_URL}/recommend`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Failed to fetch recommendations");

            const data = await res.json();
            
            const elapsed = Date.now() - start;
            if (elapsed < 4000) {
                 await new Promise(resolve => setTimeout(resolve, 4000 - elapsed));
            }

            setRecommendations(data.recommendations || []);
            setMessage("Recommendations generated.");
            
            // Wait for state update then fetch branches
            if (userLocation && data.recommendations) {
                findNearestBranches(data.recommendations);
            }

        } catch (err: unknown) {
            console.error(err);
            if (err instanceof Error) {
                 setMessage(`Error: ${err.message}`);
            } else {
                 setMessage("An unknown error occurred.");
            }
        } finally {
            setLoading(false);
            setLoadingStep(0);
        }
    };

    const findNearestBranches = async (banks: Recommendation[]) => {
        if (!userLocation) return;
        setMapLoading(true);
        setBankLocations([]);
        
        try {
            const payload = {
                user_coords: {
                    lat: userLocation.lat,
                    lng: userLocation.lng
                },
                branches: banks.map(b => ({ bank: b.bank }))
            };

            const res = await fetch(`${import.meta.env.VITE_API_URL}/nearest-branches`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("Failed to fetch nearest branches");
            
            const data = await res.json();
            
            if (data.nearest_branches) {
                const locations: BankLocation[] = data.nearest_branches.map((b: any, idx: number) => ({
                    id: `branch-${idx}`,
                    name: b.name,
                    bankName: b.bank,
                    latitude: b.lat,
                    longitude: b.lng,
                    address: b.address || ""
                }));
                setBankLocations(locations);
            }

        } catch (error) {
            console.error("Error finding branches:", error);
        } finally {
            setMapLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setProfile((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-transparent">
            <div className="max-w-7xl mx-auto space-y-16">
                {/* Header */}
                <div className="text-center max-w-2xl mx-auto animate-fade-in">
                    <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-indigo-400 tracking-tight leading-tight mb-6">
                        Education Loans
                    </h1>
                    <p className="text-lg text-slate-400 font-light leading-relaxed">
                        Discover tailored financing solutions for your academic journey.
                        Smart matching powered by AI.
                    </p>
                </div>

                {/* Available Loan Products */}
                <div className="space-y-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            Available Products
                            <span className="text-xs px-2 py-1 bg-white/10 rounded-full text-slate-300 font-normal">
                                {loanProducts.length}
                            </span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loanProducts.map((loan, i) => (
                            <div
                                key={i}
                                className="glass-card rounded-2xl p-6 hover:-translate-y-1 transition-transform duration-300 group"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                                        {loan.bank}
                                    </h3>
                                    {loan.special && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/20">
                                            <Star size={12} className="mr-1 fill-indigo-300" />
                                            Featured
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between items-center pb-3 border-b border-white/5">
                                        <span className="text-sm text-slate-400">Interest Rate</span>
                                        <span className="text-sm font-semibold text-white">
                                            {loan.interest_rate}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center pb-3 border-b border-white/5">
                                        <span className="text-sm text-slate-400">Max Amount</span>
                                        <span className="text-sm font-semibold text-emerald-400">
                                            {loan.loan_amount}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center pb-3 border-b border-white/5">
                                        <span className="text-sm text-slate-400">Collateral</span>
                                        <span className="text-xs text-slate-300 text-right max-w-[150px]">
                                            {loan.collateral}
                                        </span>
                                    </div>
                                </div>

                                <button className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-medium border border-white/10 transition-colors flex items-center justify-center gap-2 group-hover:border-indigo-500/30">
                                    View Details <ChevronRight size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Personalized Tool Section */}
                <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500/5 blur-3xl py-20 rounded-full opacity-50" />

                    <div className="relative glass-card rounded-3xl p-8 md:p-12 overflow-hidden border border-white/10">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-bold text-white mb-4">Find Your Perfect Loan Match</h2>
                            <p className="text-slate-400 max-w-xl mx-auto">
                                Use our AI recommendation engine to analyze your profile and find the best interest rates and terms available for you.
                            </p>

                            {!showRecommendationForm && (
                                <button
                                    onClick={() => setShowRecommendationForm(true)}
                                    className="mt-8 px-8 py-4 bg-white text-black text-lg font-bold rounded-full hover:scale-105 transition-transform duration-300 shadow-xl shadow-white/10 flex items-center gap-2 mx-auto"
                                >
                                    Start Assessment <ChevronRight size={20} />
                                </button>
                            )}
                        </div>

                        {showRecommendationForm && (
                            <div className="animate-fade-in max-w-3xl mx-auto space-y-8">
                                {/* Input Method Tabs */}
                                <div className="flex p-1 bg-black/40 rounded-xl backdrop-blur-sm border border-white/10 w-fit mx-auto mb-8">
                                    <button
                                        onClick={() => setInputMethod("manual")}
                                        className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${inputMethod === "manual"
                                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                                            : "text-slate-400 hover:text-white"
                                            }`}
                                    >
                                        Manual Entry
                                    </button>
                                    <button
                                        onClick={() => setInputMethod("ocr")}
                                        className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${inputMethod === "ocr"
                                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                                            : "text-slate-400 hover:text-white"
                                            }`}
                                    >
                                        Upload Documents
                                    </button>
                                </div>

                                {/* Form Content */}
                                <div className="space-y-6">
                                    {inputMethod === "manual" && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {[
                                                { field: "name", label: "Full Name", type: "text", placeholder: "e.g. John Doe" },
                                                { field: "dob", label: "Date of Birth", type: "date", placeholder: "" },
                                                { field: "college", label: "College/University", type: "text", placeholder: "e.g. IIT Delhi" },
                                                { field: "course", label: "Course", type: "text", placeholder: "e.g. B.Tech CS" },
                                            ].map(({ field, label, type, placeholder }) => (
                                                <div key={field} className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-300 ml-1">{label}</label>
                                                    <input
                                                        type={type}
                                                        value={profile[field]}
                                                        onChange={(e) => handleInputChange(field, e.target.value)}
                                                        className="w-full px-4 py-3 rounded-xl glass-input placeholder-slate-500"
                                                        placeholder={placeholder}
                                                    />
                                                </div>
                                            ))}

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-300 ml-1">CGPA</label>
                                                <input
                                                    type="number"
                                                    value={profile.cgpa}
                                                    onChange={(e) => handleInputChange("cgpa", e.target.value)}
                                                    className="w-full px-4 py-3 rounded-xl glass-input placeholder-slate-500"
                                                    placeholder="e.g. 8.5"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-300 ml-1">Loan Amount (₹)</label>
                                                <input
                                                    type="number"
                                                    value={profile.loanAmount}
                                                    onChange={(e) => handleInputChange("loanAmount", e.target.value)}
                                                    className="w-full px-4 py-3 rounded-xl glass-input placeholder-slate-500"
                                                    placeholder="e.g. 500000"
                                                />
                                            </div>
                                            <div className="space-y-2 md:col-span-2">
                                                <label className="text-sm font-medium text-slate-300 ml-1">Family Income (₹)</label>
                                                <input
                                                    type="number"
                                                    value={profile.familyIncome}
                                                    onChange={(e) => handleInputChange("familyIncome", e.target.value)}
                                                    className="w-full px-4 py-3 rounded-xl glass-input placeholder-slate-500"
                                                    placeholder="e.g. 1200000"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {inputMethod === "ocr" && (
                                        <div className="space-y-6">
                                            <div className="border-2 border-dashed border-white/10 rounded-2xl p-12 text-center hover:border-indigo-500/50 hover:bg-white/5 transition-all duration-300 cursor-pointer relative group">
                                                <input
                                                    type="file"
                                                    onChange={handleFileUpload}
                                                    accept=".pdf,.png,.jpg,.jpeg"
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                />
                                                <div className="w-16 h-16 bg-black/40 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                                    <Upload className="text-indigo-400" size={24} />
                                                </div>
                                                <p className="text-white font-medium mb-1">
                                                    {fileName || "Drop your document here"}
                                                </p>
                                                <p className="text-slate-400 text-sm">
                                                    Supports PDF, JPG, PNG (Max 10MB)
                                                </p>
                                            </div>

                                            <div className="flex justify-between items-center bg-black/20 p-4 rounded-xl border border-white/5">
                                                <span className={`text-sm ${message.includes('Error') ? 'text-red-400' : 'text-emerald-400'}`}>
                                                    {message}
                                                </span>
                                                <button
                                                    onClick={handleExtract}
                                                    disabled={!file || loading}
                                                    className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                                >
                                                    {loading ? "Processing..." : "Extract Data"}
                                                </button>
                                            </div>

                                            {profile.name && (
                                                <div className="grid grid-cols-2 gap-4 p-6 rounded-xl bg-black/30 border border-white/10">
                                                    {Object.entries(profile).map(([key, value]) => value && (
                                                        <div key={key}>
                                                            <span className="text-xs text-slate-500 uppercase">{key}</span>
                                                            <p className="text-white font-medium truncate">{value}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="pt-6 border-t border-white/10 flex flex-col items-center gap-6">
                                        {!loading ? (
                                            <div className="w-full flex justify-end">
                                                <button
                                                    onClick={getRecommendations}
                                                    disabled={loading || !profile.name}
                                                    className="px-8 py-4 primary-btn text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:shadow-none min-w-[200px]"
                                                >
                                                    Generate Recommendations
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="w-full max-w-sm mx-auto space-y-8 py-8">
                                                <DonutProgress progress={((loadingStep + 1) / STEPS.length) * 100} />
                                                
                                                <div className="space-y-4">
                                                    {STEPS.map((step, idx) => (
                                                        <div key={idx} className="flex items-center gap-3 transition-colors duration-300">
                                                            {idx <= loadingStep ? (
                                                                <CheckCircle2 className="text-emerald-400 animate-fade-in" size={20} />
                                                            ) : (
                                                                <Circle className="text-slate-600" size={20} />
                                                            )}
                                                            <span className={`text-sm font-medium transition-colors ${
                                                                idx <= loadingStep ? "text-white" : "text-slate-500"
                                                            }`}>
                                                                {step}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recommendations */}
                {recommendations && (
                    <div className="space-y-8 animate-fade-in">
                        <h2 className="text-3xl font-bold text-white text-center">
                            Recommended for You
                        </h2>
                        <div className="grid grid-cols-1 gap-6">
                            {recommendations.map((rec, i) => (
                                <div
                                    key={i}
                                    className="glass-card rounded-2xl p-8 hover:bg-white/[0.07] transition-colors border-l-4 border-l-indigo-500"
                                >
                                    <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-6">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-2xl font-bold text-white">
                                                    {rec.bank}
                                                </h3>
                                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/20">
                                                    {rec.score}% Match
                                                </span>
                                            </div>
                                            <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
                                                {rec.match_reason}
                                            </p>
                                        </div>
                                        <button 
                                            onClick={() => window.open(rec.link || `https://www.google.com/search?q=${encodeURIComponent(rec.bank + " education loan application")}`, '_blank')}
                                            className="px-6 py-2.5 bg-white text-black font-semibold rounded-lg hover:bg-indigo-50 transition-colors whitespace-nowrap"
                                        >
                                            Apply Now
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {rec.key_features.map((feature, idx) => (
                                            <div key={idx} className="flex items-center gap-2 text-slate-300 text-sm bg-black/20 px-3 py-2 rounded-lg">
                                                <CheckCircle2 size={16} className="text-indigo-400" />
                                                {feature}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Map Section */}
                        {userLocation && (
                            <div className="space-y-6 mt-12 pt-12 border-t border-white/5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <MapPin className="text-indigo-400" size={28} />
                                        <h2 className="text-2xl font-bold text-white">Nearest Branches</h2>
                                    </div>
                                    <button 
                                        onClick={() => userLocation && recommendations && findNearestBranches(recommendations)}
                                        className="text-sm text-indigo-300 hover:text-white transition-colors"
                                    >
                                        Refresh Locations
                                    </button>
                                </div>
                                
                                <div className="glass-card rounded-2xl overflow-hidden h-[500px] border border-white/10 relative">
                                    {mapLoading && (
                                        <div className="absolute inset-0 z-20 bg-black/60 flex items-center justify-center">
                                            <div className="text-white">Locating branches...</div>
                                        </div>
                                    )}
                                    <Map
                                        initialViewState={{
                                            longitude: userLocation.lng,
                                            latitude: userLocation.lat,
                                            zoom: 12
                                        }}
                                        style={{ width: '100%', height: '100%' }}
                                        mapStyle="mapbox://styles/mapbox/dark-v11"
                                        mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
                                    >
                                        <NavigationControl position="top-right" />
                                        
                                        {/* User Location */}
                                        <Marker longitude={userLocation.lng} latitude={userLocation.lat} color="#6366f1">
                                           <div className="w-4 h-4 rounded-full bg-indigo-500 ring-4 ring-indigo-500/30 animate-pulse" />
                                        </Marker>

                                        {/* Bank Branches */}
                                        {bankLocations.map((loc, idx) => (
                                            <Marker 
                                                key={`${loc.id}-${idx}`}
                                                longitude={loc.longitude} 
                                                latitude={loc.latitude}
                                                color="#ef4444"
                                                onClick={(e: any) => {
                                                    e.originalEvent.stopPropagation();
                                                    setSelectedBank(loc);
                                                }}
                                            >
                                                <MapPin className="text-red-500 hover:scale-110 transition-transform cursor-pointer" size={24} fill="currentColor" />
                                            </Marker>
                                        ))}

                                        {/* Popup */}
                                        {selectedBank && (
                                            <Popup
                                                longitude={selectedBank.longitude}
                                                latitude={selectedBank.latitude}
                                                anchor="bottom"
                                                onClose={() => setSelectedBank(null)}
                                                closeButton={true}
                                                closeOnClick={false}
                                                className="text-black"
                                            >
                                                <div className="p-2 min-w-[200px]">
                                                    <h3 className="font-bold text-gray-900">{selectedBank.name}</h3>
                                                    <p className="text-xs text-gray-500 mt-1">{selectedBank.address}</p>
                                                    <button 
                                                        onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedBank.latitude},${selectedBank.longitude}`, '_blank')}
                                                        className="mt-3 w-full py-1.5 bg-indigo-600 text-white rounded text-xs font-semibold flex items-center justify-center gap-1 hover:bg-indigo-700"
                                                    >
                                                        <Navigation size={12} /> Navigate
                                                    </button>
                                                </div>
                                            </Popup>
                                        )}
                                    </Map>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
