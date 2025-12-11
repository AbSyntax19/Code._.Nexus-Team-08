import { useState } from 'react';
import { Search, GraduationCap, Building2, Calendar, Award, CheckCircle2, AlertCircle, ExternalLink, Loader2 } from 'lucide-react';

interface Scholarship {
    name: string;
    provider: string;
    amount: string;
    description: string;
    eligibility: string;
    deadline: string;
    category: string;
    link?: string;
}

interface FormData {
    course: string;
    college: string;
    cgpa: string;
    familyIncome: string;
    category: string;
}

const Scholarships = () => {
    const [formData, setFormData] = useState<FormData>({
        course: '',
        college: '',
        cgpa: '',
        familyIncome: '',
        category: 'General'
    });

    const [scholarships, setScholarships] = useState<Scholarship[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searched, setSearched] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSearched(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/scholarships`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    course: formData.course,
                    college: formData.college,
                    cgpa: parseFloat(formData.cgpa) || 0,
                    familyIncome: parseInt(formData.familyIncome) || 0,
                    category: formData.category
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch scholarships');
            }

            const data = await response.json();
            setScholarships(data.scholarships || []);
        } catch (err: unknown) {
            console.error(err);
            if (err instanceof Error) {
                setError(`Failed to fetch scholarships: ${err.message}`);
            } else {
                 setError('Failed to fetch scholarships. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const getCategoryColor = (category: string) => {
        if (category.includes('Merit')) return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
        if (category.includes('Need')) return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
        if (category.includes('Government')) return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-transparent">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-4 animate-fade-in">
                    <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-200 via-teal-400 to-emerald-600 tracking-tight leading-tight">
                        Scholarship Finder
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Unlock your potential with financial aid tailored to your academic profile.
                    </p>
                </div>

                {/* Search Form */}
                <div className="glass-card p-8 rounded-3xl animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="course" className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                    <GraduationCap size={16} className="text-emerald-400" /> Course/Program
                                </label>
                                <input
                                    type="text"
                                    id="course"
                                    name="course"
                                    value={formData.course}
                                    onChange={handleChange}
                                    className="w-full glass-input px-4 py-3 rounded-xl"
                                    placeholder="e.g., B.Tech Computer Science"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="college" className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                    <Building2 size={16} className="text-emerald-400" /> College/University
                                </label>
                                <input
                                    type="text"
                                    id="college"
                                    name="college"
                                    value={formData.college}
                                    onChange={handleChange}
                                    className="w-full glass-input px-4 py-3 rounded-xl"
                                    placeholder="e.g., IIT Delhi"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="category" className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                    <Award size={16} className="text-emerald-400" /> Category
                                </label>
                                <div className="relative">
                                    <select
                                        id="category"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full glass-input px-4 py-3 rounded-xl appearance-none cursor-pointer"
                                    >
                                        <option value="General" className="bg-slate-900">General</option>
                                        <option value="SC" className="bg-slate-900">SC (Scheduled Caste)</option>
                                        <option value="ST" className="bg-slate-900">ST (Scheduled Tribe)</option>
                                        <option value="OBC" className="bg-slate-900">OBC (Other Backward Class)</option>
                                        <option value="EWS" className="bg-slate-900">EWS (Economically Weaker Section)</option>
                                        <option value="Minority" className="bg-slate-900">Minority</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        ▼
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="cgpa" className="text-sm font-medium text-slate-300">CGPA/Percentage</label>
                                <input
                                    type="number"
                                    id="cgpa"
                                    name="cgpa"
                                    value={formData.cgpa}
                                    onChange={handleChange}
                                    className="w-full glass-input px-4 py-3 rounded-xl"
                                    placeholder="e.g., 8.5"
                                    step="0.01"
                                    min="0"
                                    max="10"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="familyIncome" className="text-sm font-medium text-slate-300">Family Annual Income (₹)</label>
                                <input
                                    type="number"
                                    id="familyIncome"
                                    name="familyIncome"
                                    value={formData.familyIncome}
                                    onChange={handleChange}
                                    className="w-full glass-input px-4 py-3 rounded-xl"
                                    placeholder="e.g., 300000"
                                />
                            </div>

                            <div className="flex items-end">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full primary-btn py-3 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 size={20} className="animate-spin" />
                                            Scanning...
                                        </>
                                    ) : (
                                        <>
                                            <Search size={20} />
                                            Find Scholarships
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="animate-fade-in p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-200">
                        <AlertCircle className="text-red-400" />
                        {error}
                    </div>
                )}

                {/* No Results */}
                {searched && !loading && scholarships.length === 0 && !error && (
                    <div className="text-center py-12 animate-fade-in">
                        <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="text-slate-500" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-white">No scholarships found</h3>
                        <p className="text-slate-400 mt-2">Try adjusting your filters to see more results.</p>
                    </div>
                )}

                {/* Results Grid */}
                {scholarships.length > 0 && (
                    <div className="space-y-6 animate-fade-in">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            Available Scholarships
                            <span className="bg-emerald-500/20 text-emerald-400 text-sm py-1 px-3 rounded-full border border-emerald-500/20">
                                {scholarships.length} matches
                            </span>
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {scholarships.map((scholarship, index) => (
                                <div
                                    key={index}
                                    className="glass-card p-6 rounded-2xl group hover:border-emerald-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-900/10"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className={`text-xs font-semibold px-2 py-1 rounded inline-block mb-2 border ${getCategoryColor(scholarship.category)}`}>
                                                {scholarship.category}
                                            </div>
                                            <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                                                {scholarship.name}
                                            </h3>
                                            <p className="text-slate-400 text-sm mt-1">{scholarship.provider}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-baseline gap-1 mb-6">
                                        <span className="text-2xl font-bold text-emerald-400">₹ {scholarship.amount}</span>
                                        <span className="text-slate-500 text-sm">/ year</span>
                                    </div>

                                    <p className="text-slate-300 text-sm mb-6 line-clamp-3">
                                        {scholarship.description}
                                    </p>

                                    <div className="space-y-3 mb-6 bg-black/20 p-4 rounded-xl border border-white/5">
                                        <div className="flex gap-3 text-sm">
                                            <CheckCircle2 className="text-emerald-500 shrink-0" size={18} />
                                            <div>
                                                <span className="text-slate-400 block text-xs uppercase tracking-wide">Eligibility</span>
                                                <span className="text-slate-200">{scholarship.eligibility}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 text-sm">
                                            <Calendar className="text-blue-500 shrink-0" size={18} />
                                            <div>
                                                <span className="text-slate-400 block text-xs uppercase tracking-wide">Deadline</span>
                                                <span className="text-slate-200">{scholarship.deadline}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {scholarship.link && (
                                        <a
                                            href={scholarship.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full primary-btn py-3 rounded-xl font-medium flex items-center justify-center gap-2 group-hover:bg-emerald-600 transition-colors"
                                        >
                                            Apply Now <ExternalLink size={16} />
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Scholarships;
