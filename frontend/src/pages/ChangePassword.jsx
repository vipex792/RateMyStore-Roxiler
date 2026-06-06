import { useState } from 'react';
import api from '../api/axios';
import FormInput from '../components/FormInput';
import { validatePassword, validateConfirmPassword } from '../utils/validators';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiLock } from 'react-icons/fi';

function ChangePassword({ showToast }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    code: '',
  });
  const [errors, setErrors] = useState({});
  const [sendingCode, setSendingCode] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSendCode = async () => {
    setSendingCode(true);
    try {
      const response = await api.post('/users/password/send-code');
      showToast('Verification code sent to your email!', 'success');
      if (response.data?.code) {
        setFormData((prev) => ({ ...prev, code: response.data.code }));
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to send verification code.';
      showToast(message, 'error');
    } finally {
      setSendingCode(false);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    const newPassErr = validatePassword(formData.newPassword);
    if (newPassErr) newErrors.newPassword = newPassErr;

    const confirmErr = validateConfirmPassword(formData.newPassword, formData.confirmPassword);
    if (confirmErr) newErrors.confirmPassword = confirmErr;

    if (!formData.code) {
      newErrors.code = 'Verification code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await api.put('/users/password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        code: formData.code,
      });
      showToast('Password changed successfully! Redirecting...', 'success');
      
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 1500);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to change password.';
      showToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid =
    formData.currentPassword &&
    formData.newPassword &&
    formData.confirmPassword &&
    formData.code;

  return (
    <div className="change-password-page">
      <div className="glass-card-static change-password-card fade-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
          <div className="stats-card-icon">
            <FiLock />
          </div>
          <div>
            <h3>Change Password</h3>
            <p className="text-sm text-muted">Update your account password</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <FormInput
            label="Current Password"
            type="password"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            error={errors.currentPassword}
            placeholder="Enter current password"
            required
          />

          <FormInput
            label="New Password"
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            error={errors.newPassword}
            placeholder="8-16 chars, 1 uppercase, 1 special char"
            required
          />

          <FormInput
            label="Confirm New Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            placeholder="Confirm new password"
            required
          />

          <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'flex-end', marginBottom: 'var(--space-md)' }}>
            <div style={{ flex: 1 }}>
              <FormInput
                label="Verification Code"
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                error={errors.code}
                placeholder="Enter 6-digit code"
                required
              />
            </div>
            <button
              type="button"
              className={`btn btn-secondary ${sendingCode ? 'btn-loading' : ''}`}
              onClick={handleSendCode}
              disabled={sendingCode}
              style={{ height: '42px', marginBottom: errors.code ? '18px' : '0' }}
            >
              {sendingCode ? '' : 'Send Code'}
            </button>
          </div>

          <button
            type="submit"
            className={`btn btn-primary btn-block btn-lg ${submitting ? 'btn-loading' : ''}`}
            disabled={!isFormValid || submitting}
            style={{ marginTop: 'var(--space-md)' }}
          >
            {submitting ? '' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChangePassword;
