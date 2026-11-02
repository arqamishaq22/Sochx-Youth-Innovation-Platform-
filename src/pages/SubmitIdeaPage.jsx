import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { ideasAPI } from '../services/api';
import '../styles/SubmitIdea.css';

const SubmitIdeaPage = () => {
  const { isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    problemDescription: '',
    proposedSolution: '',
    category: 'Technology',
    submitterName: '',
    submitterEmail: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Check login status & pre-fill name and email
  useEffect(() => {
    if (!isAuthenticated) {
      alert('You must be logged in to submit an idea. Please log in or create an account.');
      navigate('/login', { state: { from: { pathname: '/submit-idea' } }, replace: true });
    } else if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        submitterName: currentUser.fullName || currentUser.name || '',
        submitterEmail: currentUser.email || '',
      }));
    }
  }, [isAuthenticated, currentUser, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.problemDescription || !formData.proposedSolution || !formData.category) {
      setError('Please fill in all required fields (Title, Problem, Solution, and Category).');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: formData.title.trim(),
        problemDescription: formData.problemDescription.trim(),
        proposedSolution: formData.proposedSolution.trim(),
        category: formData.category,
        submitterName: formData.submitterName.trim() || currentUser?.fullName || currentUser?.name || 'Student Innovator',
        submitterEmail: formData.submitterEmail.trim() || currentUser?.email || '',
      };

      await ideasAPI.create(payload);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Failed to submit idea to server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="submit-container">
      <div className="submit-card">
        {submitted ? (
          <div className="submit-success-card">
            <div className="submit-success-icon">
              <CheckCircle2 size={36} />
            </div>
            <h2 className="submit-title">Idea Submitted Successfully!</h2>
            <p className="submit-subtitle" style={{ marginBottom: '28px' }}>
              Your project proposal has been saved to the MySQL database and queued for community review.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => navigate('/ideas')}
                className="submit-submit-btn"
                style={{ width: 'auto', padding: '12px 24px' }}
              >
                View in Ideas Feed
                <ArrowRight size={16} />
              </button>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({
                    title: '',
                    problemDescription: '',
                    proposedSolution: '',
                    category: 'Technology',
                    submitterName: currentUser?.fullName || currentUser?.name || '',
                    submitterEmail: currentUser?.email || '',
                  });
                }}
                className="home-btn-secondary"
                style={{ color: '#4c1d95', borderColor: '#c4b5fd', background: '#f5f3ff' }}
              >
                Submit Another
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="submit-header">
              <div className="submit-header-icon">
                <Sparkles size={26} />
              </div>
              <h1 className="submit-title">Pitch Your Innovation</h1>
              <p className="submit-subtitle">
                Share your visionary idea with developers, founders, and the SochX community.
              </p>
            </div>

            {error && (
              <div className="auth-error-banner" style={{ marginBottom: '20px' }}>
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="submit-form">
              {/* Title */}
              <div className="submit-field-group">
                <label htmlFor="submit-title" className="submit-label">
                  Idea Title <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  id="submit-title"
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Smart Traffic Management AI"
                  className="submit-input"
                />
              </div>

              {/* Category */}
              <div className="submit-field-group">
                <label htmlFor="submit-category" className="submit-label">
                  Category Domain <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  id="submit-category"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="submit-select"
                >
                  <option value="Technology">Technology</option>
                  <option value="Education">Education</option>
                  <option value="Health">Health</option>
                  <option value="Business">Business</option>
                  <option value="Social">Social</option>
                  <option value="Sustainability">Sustainability</option>
                </select>
              </div>

              {/* Problem Description */}
              <div className="submit-field-group">
                <label htmlFor="submit-problem" className="submit-label">
                  The Problem <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  id="submit-problem"
                  name="problemDescription"
                  required
                  rows={4}
                  value={formData.problemDescription}
                  onChange={handleChange}
                  placeholder="Describe the real-world friction, inefficiency, or gap your idea addresses..."
                  className="submit-textarea"
                />
              </div>

              {/* Proposed Solution */}
              <div className="submit-field-group">
                <label htmlFor="submit-solution" className="submit-label">
                  Proposed Solution & Tech Stack <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  id="submit-solution"
                  name="proposedSolution"
                  required
                  rows={4}
                  value={formData.proposedSolution}
                  onChange={handleChange}
                  placeholder="Explain how your solution works, algorithms/sensors involved, and measurable impact..."
                  className="submit-textarea"
                />
              </div>

              {/* Submitter Name (Pre-filled) */}
              <div className="submit-field-group">
                <label htmlFor="submit-name" className="submit-label">
                  Your Full Name
                </label>
                <input
                  id="submit-name"
                  type="text"
                  name="submitterName"
                  value={formData.submitterName}
                  onChange={handleChange}
                  placeholder="Your Name"
                  className="submit-input"
                />
              </div>

              {/* Submitter Email (Pre-filled) */}
              <div className="submit-field-group">
                <label htmlFor="submit-email" className="submit-label">
                  Contact Email
                </label>
                <input
                  id="submit-email"
                  type="email"
                  name="submitterEmail"
                  value={formData.submitterEmail}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  className="submit-input"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="submit-submit-btn"
              >
                {isSubmitting ? (
                  <span>Submitting to Database...</span>
                ) : (
                  <>
                    <span>Submit Innovation</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default SubmitIdeaPage;
