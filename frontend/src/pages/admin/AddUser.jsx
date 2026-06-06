import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import FormInput from '../../components/FormInput';
import {
  validateName,
  validateEmail,
  validatePassword,
  validateAddress,
} from '../../utils/validators';
import { FiArrowLeft, FiUserPlus } from 'react-icons/fi';

function AddUser({ showToast }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
    role: 'user',
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

    if (nameErr) newErrors.name = nameErr;
    if (emailErr) newErrors.email = emailErr;
    if (addressErr) newErrors.address = addressErr;
    if (passErr) newErrors.password = passErr;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await api.post('/users', formData);
      showToast('User created successfully!', 'success');
      navigate('/admin/users');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create user.';
      showToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid =
    formData.name &&
    formData.email &&
    formData.address &&
    formData.password &&
    formData.role;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
          <button className="btn btn-ghost" onClick={() => navigate('/admin/users')}>
            <FiArrowLeft /> Back
          </button>
          <div>
            <h1>Add User</h1>
            <p>Create a new platform user</p>
          </div>
        </div>
      </div>

      <div className="glass-card-static form-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
          <div className="stats-card-icon">
            <FiUserPlus />
          </div>
          <h3>User Information</h3>
        </div>

        <form onSubmit={handleSubmit}>
          <FormInput
            label="Full Name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="Enter full name (20-60 characters)"
            required
          />

          <FormInput
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="Enter email address"
            required
          />

          <FormInput
            label="Address"
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            error={errors.address}
            placeholder="Enter address (max 400 characters)"
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

          <div className="form-group">
            <label className="form-label">
              Role <span style={{ color: 'var(--error)', marginLeft: '4px' }}>*</span>
            </label>
            <select
              name="role"
              className="form-select"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="user">Normal User</option>
              <option value="admin">Administrator</option>
              <option value="store_owner">Store Owner</option>
            </select>
          </div>

          <button
            type="submit"
            className={`btn btn-primary btn-block btn-lg ${submitting ? 'btn-loading' : ''}`}
            disabled={!isFormValid || submitting}
            style={{ marginTop: 'var(--space-md)' }}
          >
            {submitting ? '' : 'Create User'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddUser;
