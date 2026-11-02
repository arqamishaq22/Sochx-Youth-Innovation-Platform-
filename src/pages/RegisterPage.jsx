import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, AlertCircle, Eye, EyeOff, User, AtSign, Mail, Lock } from 'lucide-react';
import '../styles/Auth.css';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (!formData.agreeTerms) {
      setError('You must agree to the Terms & Conditions to create an account.');
      return;
    }

    setIsSubmitting(true);

    const result = await register({
      fullName: formData.fullName.trim(),
      username: formData.username.trim().toLowerCase(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
    });

    setIsSubmitting(false);

    if (result.success) {
      navigate('/profile', { replace: true });
    } else {
      setError(result.error || 'Registration failed. Please check your inputs.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '580px' }}>
        
        {/* Header */}
        <div className="auth-header">
          <div className="auth-header-icon">
            <Sparkles size={26} />
          </div>
          <h1 className="auth-title">Create Your Account</h1>
          <p className="auth-subtitle">
            Join SochX and start sharing your ideas.
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="auth-error-banner">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Section: PERSONAL INFORMATION */}
          <div className="auth-section-heading">PERSONAL INFORMATION</div>

          {/* Full Name */}
          <div className="auth-field-group">
            <label htmlFor="reg-fullname" className="auth-label">
              Full Name <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div className="auth-input-wrapper">
              <User size={18} className="auth-input-icon" />
              <input
                id="reg-fullname"
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g. Arqam Ishaq"
                className="auth-input"
              />
            </div>
          </div>

          {/* Username & Email Two Columns */}
          <div className="auth-two-cols">
            <div className="auth-field-group">
              <label htmlFor="reg-username" className="auth-label">
                Username <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div className="auth-input-wrapper">
                <AtSign size={18} className="auth-input-icon" />
                <input
                  id="reg-username"
                  type="text"
                  name="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="arqamishaq"
                  className="auth-input"
                />
              </div>
            </div>

            <div className="auth-field-group">
              <label htmlFor="reg-email" className="auth-label">
                Email Address <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div className="auth-input-wrapper">
                <Mail size={18} className="auth-input-icon" />
                <input
                  id="reg-email"
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="arqam@example.com"
                  className="auth-input"
                />
              </div>
            </div>
          </div>

          {/* Section: SECURITY */}
          <div className="auth-section-heading">ACCOUNT SECURITY</div>

          {/* Password & Confirm Password Two Columns */}
          <div className="auth-two-cols">
            <div className="auth-field-group">
              <label htmlFor="reg-password" className="auth-label">
                Password <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div className="auth-input-wrapper">
                <Lock size={18} className="auth-input-icon" />
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="auth-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="auth-eye-btn"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="auth-field-group">
              <label htmlFor="reg-confirm-password" className="auth-label">
                Confirm Password <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div className="auth-input-wrapper">
                <Lock size={18} className="auth-input-icon" />
                <input
                  id="reg-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="auth-input"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="auth-eye-btn"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          {/* Agree Terms Checkbox */}
          <div className="auth-checkbox-row">
            <input
              id="reg-terms"
              type="checkbox"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleChange}
              className="auth-checkbox"
            />
            <label htmlFor="reg-terms" className="auth-checkbox-label">
              I agree to the Terms of Service and Community Guidelines
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="auth-btn-gradient"
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Footer */}
        <div className="auth-footer">
          <p className="auth-footer-text">
            Already have an account?{' '}
            <Link to="/login" className="auth-footer-link">
              Log In
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;
