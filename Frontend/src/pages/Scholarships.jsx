import { useState } from 'react';
import './scholarships.css';

const Scholarships = () => {
    const [formData, setFormData] = useState({
        course: '',
        college: '',
        cgpa: '',
        familyIncome: '',
        category: 'General'
    });

    const [scholarships, setScholarships] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searched, setSearched] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSearched(true);

        try {
            const response = await fetch('http://localhost:8000/scholarships', {
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
        } catch (err) {
            setError('Failed to fetch scholarships. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getCategoryColor = (category) => {
        const colors = {
            'Merit': '#4CAF50',
            'Merit-based': '#4CAF50',
            'Need-based': '#2196F3',
            'Category-specific': '#FF9800',
            'Course-specific': '#9C27B0',
            'Government': '#00BCD4',
        };

        for (const [key, color] of Object.entries(colors)) {
            if (category.includes(key)) return color;
        }
        return '#757575';
    };

    return (
        <div className="scholarships-container">
            <div className="scholarships-header">
                <h1>🎓 Scholarship Finder</h1>
                <p>Find scholarships tailored to your profile using AI</p>
            </div>

            <div className="scholarship-search-section">
                <form onSubmit={handleSubmit} className="scholarship-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="course">Course/Program</label>
                            <input
                                type="text"
                                id="course"
                                name="course"
                                value={formData.course}
                                onChange={handleChange}
                                placeholder="e.g., B.Tech Computer Science"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="college">College/University</label>
                            <input
                                type="text"
                                id="college"
                                name="college"
                                value={formData.college}
                                onChange={handleChange}
                                placeholder="e.g., IIT Delhi"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="cgpa">CGPA/Percentage</label>
                            <input
                                type="number"
                                id="cgpa"
                                name="cgpa"
                                value={formData.cgpa}
                                onChange={handleChange}
                                placeholder="e.g., 8.5"
                                step="0.01"
                                min="0"
                                max="10"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="familyIncome">Family Annual Income (₹)</label>
                            <input
                                type="number"
                                id="familyIncome"
                                name="familyIncome"
                                value={formData.familyIncome}
                                onChange={handleChange}
                                placeholder="e.g., 300000"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group full-width">
                            <label htmlFor="category">Category</label>
                            <select
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                            >
                                <option value="General">General</option>
                                <option value="SC">SC (Scheduled Caste)</option>
                                <option value="ST">ST (Scheduled Tribe)</option>
                                <option value="OBC">OBC (Other Backward Class)</option>
                                <option value="EWS">EWS (Economically Weaker Section)</option>
                                <option value="Minority">Minority</option>
                            </select>
                        </div>
                    </div>

                    <button type="submit" className="search-btn" disabled={loading}>
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                Searching...
                            </>
                        ) : (
                            <>
                                <span>🔍</span>
                                Find Scholarships
                            </>
                        )}
                    </button>
                </form>
            </div>

            {error && (
                <div className="error-message">
                    <span>⚠️</span>
                    {error}
                </div>
            )}

            {searched && !loading && scholarships.length === 0 && !error && (
                <div className="no-results">
                    <span>📭</span>
                    <p>No scholarships found. Try adjusting your criteria.</p>
                </div>
            )}

            {scholarships.length > 0 && (
                <div className="scholarships-results">
                    <h2>Available Scholarships ({scholarships.length})</h2>
                    <div className="scholarships-grid">
                        {scholarships.map((scholarship, index) => (
                            <div key={index} className="scholarship-card">
                                <div className="scholarship-header">
                                    <h3>{scholarship.name}</h3>
                                    <span
                                        className="scholarship-category"
                                        style={{ backgroundColor: getCategoryColor(scholarship.category) }}
                                    >
                                        {scholarship.category}
                                    </span>
                                </div>

                                <div className="scholarship-provider">
                                    <strong>Provider:</strong> {scholarship.provider}
                                </div>

                                <div className="scholarship-amount">
                                    <span className="amount-label">Award Amount</span>
                                    <span className="amount-value">₹ {scholarship.amount}</span>
                                </div>

                                <div className="scholarship-description">
                                    {scholarship.description}
                                </div>

                                <div className="scholarship-details">
                                    <div className="detail-item">
                                        <span className="detail-icon">✓</span>
                                        <div>
                                            <strong>Eligibility</strong>
                                            <p>{scholarship.eligibility}</p>
                                        </div>
                                    </div>

                                    <div className="detail-item">
                                        <span className="detail-icon">📅</span>
                                        <div>
                                            <strong>Deadline</strong>
                                            <p>{scholarship.deadline}</p>
                                        </div>
                                    </div>
                                </div>

                                {scholarship.link && (
                                    <a
                                        href={scholarship.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="apply-btn"
                                    >
                                        Apply Now →
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Scholarships;
