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
import { FiStar } from 'react-icons/fi';

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
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: '500px' }}>
        <div className="auth-header">
          <div className="auth-logo"><FiStar /></div>
          <h2>Create Account</h2>
          <p>Join the Store Rating Platform</p>
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
              <option value="admin">Administrator</option>
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
            style={{ marginTop: 'var(--space-md)' }}
          >
            {submitting ? '' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;
