import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FormInput from '../components/FormInput';
import { validateEmail, validatePassword } from '../utils/validators';
import { FiStar } from 'react-icons/fi';

function Login({ showToast }) {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '', role: 'user' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
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
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo"><FiStar /></div>
          <h2>Welcome Back</h2>
          <p>Sign in to your account</p>
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

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--space-md)' }}>
            <Link to="/forgot-password" style={{ fontSize: 'var(--font-size-sm)' }}>Forgot password?</Link>
          </div>

          <button
            type="submit"
            className={`btn btn-primary btn-block btn-lg ${submitting ? 'btn-loading' : ''}`}
            disabled={!isFormValid || submitting}
            style={{ marginTop: 'var(--space-md)' }}
          >
            {submitting ? '' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
