import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FormInput from '../components/FormInput';
import { validateEmail, validatePassword } from '../utils/validators';
import { FiStar, FiShield, FiTrendingUp, FiMessageSquare } from 'react-icons/fi';

function Login({ showToast }) {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'user',
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    const emailErr = validateEmail(formData.email);
    const passErr = validatePassword(formData.password);
    if (emailErr) newErrors.email = emailErr;
    if (passErr) newErrors.password = passErr;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const user = await login(formData.email, formData.password, formData.role);
      showToast('Welcome back! Login successful.', 'success');
      switch (user.role) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'store_owner':
          navigate('/store-owner/dashboard');
          break;
        default:
          navigate('/stores');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please check your credentials.';
      showToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid = formData.email && formData.password && formData.role;

  return (
    <div className="auth-split-layout">
      {/* Left side illustration and welcome panel */}
      <div className="auth-split-left">
        <div className="auth-split-left-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <div className="auth-logo" style={{ margin: 0, width: '40px', height: '40px', fontSize: '1.25rem' }}>
              <FiStar />
            </div>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', letterSpacing: '0.5px' }}>RateMyStore</span>
          </div>

          <h1>Discover & Rate Local Stores</h1>
          <p>The premium portal for customer feedback, business analytics, and store reputation growth.</p>

          <div className="auth-features-list">
            <div className="auth-feature-item">
              <div className="auth-feature-icon">
                <FiMessageSquare />
              </div>
              <div>
                <div className="auth-feature-title">Verified Customer Reviews</div>
                <div className="auth-feature-desc">Share authentic feedback and browse rated establishments near you.</div>
              </div>
            </div>

            <div className="auth-feature-item">
              <div className="auth-feature-icon">
                <FiTrendingUp />
              </div>
              <div>
                <div className="auth-feature-title">Store Owner Dashboard</div>
                <div className="auth-feature-desc">Track real-time rating distribution, monthly trends, and export reviews.</div>
              </div>
            </div>

            <div className="auth-feature-item">
              <div className="auth-feature-icon">
                <FiShield />
              </div>
              <div>
                <div className="auth-feature-title">Enterprise Security & Roles</div>
                <div className="auth-feature-desc">Role-based portal permissions configured for admins, owners, and users.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side form card */}
      <div className="auth-split-right">
        <div className="auth-card" style={{ maxWidth: '440px', width: '100%' }}>
          <div className="auth-header" style={{ textAlign: 'left', marginBottom: '32px' }}>
            <h2>Welcome Back</h2>
            <p>Sign in to continue to your dashboard</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Sign In As</label>
              <select
                name="role"
                className="form-select"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="user">User / Customer</option>
                <option value="store_owner">Store Owner</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

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
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="Enter your password"
              required
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  style={{ accentColor: 'var(--accent-purple)' }}
                />
                Remember Me
              </label>
              <Link to="/forgot-password" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className={`btn btn-primary btn-block btn-lg ${submitting ? 'btn-loading' : ''}`}
              disabled={!isFormValid || submitting}
            >
              {submitting ? '' : 'Sign In'}
            </button>
          </form>

          <div className="auth-footer" style={{ textAlign: 'left', marginTop: '24px', borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
            Don't have an account? <Link to="/signup" style={{ fontWeight: 600 }}>Create an account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
