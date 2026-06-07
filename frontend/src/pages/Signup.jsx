import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FormInput from '../components/FormInput';
import {
  validateName,
  validateEmail,
  validatePassword,
  validateAddress,
  validateConfirmPassword,
} from '../utils/validators';
import { FiStar, FiCheck, FiUsers, FiShoppingBag, FiStar as FiStarIcon } from 'react-icons/fi';

function Signup({ showToast }) {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    role: 'user',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const getPasswordStrength = (pass) => {
    if (!pass) return { label: 'None', color: 'var(--border-subtle)', percent: 0 };
    let score = 0;
    if (pass.length >= 8) score++;
    if (pass.length >= 12) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pass)) score++;

    if (score <= 1) {
      return { label: 'Weak', color: '#ef4444', percent: 25 };
    } else if (score === 2) {
      return { label: 'Fair', color: '#f59e0b', percent: 50 };
    } else if (score === 3) {
      return { label: 'Good', color: '#3b82f6', percent: 75 };
    } else {
      return { label: 'Strong', color: '#10b981', percent: 100 };
    }
  };

  const pwdStrength = getPasswordStrength(formData.password);

  const validate = () => {
    const newErrors = {};
    const nameErr = validateName(formData.name);
    const emailErr = validateEmail(formData.email);
    const addressErr = validateAddress(formData.address);
    const passErr = validatePassword(formData.password);
    const confirmErr = validateConfirmPassword(formData.password, formData.confirmPassword);

    if (nameErr) newErrors.name = nameErr;
    if (emailErr) newErrors.email = emailErr;
    if (addressErr) newErrors.address = addressErr;
    if (passErr) newErrors.password = passErr;
    if (confirmErr) newErrors.confirmPassword = confirmErr;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await signup({
        name: formData.name,
        email: formData.email,
        address: formData.address,
        role: formData.role,
        password: formData.password,
      });
      showToast('Account created successfully! Please sign in.', 'success');
      navigate('/login');
    } catch (err) {
      const message = err.response?.data?.message || 'Signup failed. Please try again.';
      showToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid =
    formData.name &&
    formData.email &&
    formData.address &&
    formData.role &&
    formData.password &&
    formData.confirmPassword;

  return (
    <div className="auth-split-layout">
      {/* Left onboarding / benefits panel */}
      <div className="auth-split-left">
        <div className="auth-split-left-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <div className="auth-logo" style={{ margin: 0, width: '40px', height: '40px', fontSize: '1.25rem' }}>
              <FiStar />
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', letterSpacing: '0.5px' }}>RateMyStore</span>
          </div>

          <h1>Join Our Rating Platform</h1>
          <p>Create an account to begin rating stores or list your store and view customer analytics.</p>

          <div className="auth-features-list">
            <div className="auth-feature-item">
              <div className="auth-feature-icon">
                <FiUsers />
              </div>
              <div>
                <div className="auth-feature-title">As a Customer / User</div>
                <div className="auth-feature-desc">Search local stores, read feedback from others, and rate your overall experience.</div>
              </div>
            </div>

            <div className="auth-feature-item">
              <div className="auth-feature-icon">
                <FiShoppingBag />
              </div>
              <div>
                <div className="auth-feature-title">As a Store Owner</div>
                <div className="auth-feature-desc">Claim your store profile, observe reviews, track store ratings, and export reports.</div>
              </div>
            </div>

            <div className="auth-feature-item">
              <div className="auth-feature-icon">
                <FiStarIcon />
              </div>
              <div>
                <div className="auth-feature-title">Dynamic Rating Index</div>
                <div className="auth-feature-desc">Our smart rating distribution calculates transparent score reviews instantly.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right registration form card */}
      <div className="auth-split-right">
        <div className="auth-card" style={{ maxWidth: '480px', width: '100%', padding: 'var(--space-xl)' }}>
          <div className="auth-header" style={{ textAlign: 'left', marginBottom: '24px' }}>
            <h2>Create Account</h2>
            <p>Join the Store Rating Platform today</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Register As</label>
              <select
                name="role"
                className="form-select"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="user">User / Customer</option>
                <option value="store_owner">Store Owner</option>
              </select>
            </div>

            <FormInput
              label="Full Name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              placeholder="Enter your full name (20-60 characters)"
              required
            />

            <FormInput
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="Enter your email"
              required
            />

            <FormInput
              label="Address"
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              error={errors.address}
              placeholder="Enter your address (max 400 characters)"
              required
            />

            <FormInput
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="8-16 chars, 1 uppercase, 1 special char"
              required
            />

            {/* Password strength meter */}
            {formData.password && (
              <div className="pwd-strength-container">
                <div className="pwd-strength-bar">
                  <div
                    className="pwd-strength-fill"
                    style={{
                      width: `${pwdStrength.percent}%`,
                      backgroundColor: pwdStrength.color,
                    }}
                  />
                </div>
                <span className="pwd-strength-text" style={{ color: pwdStrength.color }}>
                  Password Strength: {pwdStrength.label}
                </span>
              </div>
            )}

            <FormInput
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              placeholder="Confirm your password"
              required
            />

            <button
              type="submit"
              className={`btn btn-primary btn-block btn-lg ${submitting ? 'btn-loading' : ''}`}
              disabled={!isFormValid || submitting}
              style={{ marginTop: '8px' }}
            >
              {submitting ? '' : 'Create Account'}
            </button>
          </form>

          <div className="auth-footer" style={{ textAlign: 'left', marginTop: '24px', borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
            Already have an account? <Link to="/login" style={{ fontWeight: 600 }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
