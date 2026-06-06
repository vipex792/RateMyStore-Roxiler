import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import FormInput from '../components/FormInput';
import { validateEmail, validatePassword, validateConfirmPassword } from '../utils/validators';
import { FiStar } from 'react-icons/fi';

function ForgotPassword({ showToast }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleSendCode = async (e) => {
    e.preventDefault();
    const emailErr = validateEmail(email);
    if (emailErr) {
      setErrors({ email: emailErr });
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const response = await api.post('/auth/forgot-password/send-code', { email });
      showToast('Verification code sent to your email.', 'success');
      if (response.data?.code) {
        setCode(response.data.code);
      }
      setStep(2);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to send verification code.';
      showToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!code) {
      newErrors.code = 'Verification code is required';
    }
    const passErr = validatePassword(newPassword);
    if (passErr) newErrors.newPassword = passErr;
    const confirmErr = validateConfirmPassword(newPassword, confirmPassword);
    if (confirmErr) newErrors.confirmPassword = confirmErr;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      await api.post('/auth/forgot-password/reset', { email, code, newPassword });
      showToast('Password reset successful! Please sign in.', 'success');
      navigate('/login');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to reset password.';
      showToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo"><FiStar /></div>
          <h2>Reset Password</h2>
          <p>{step === 1 ? 'Enter your email to receive a code' : 'Enter the code and your new password'}</p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendCode}>
            <FormInput
              label="Email Address"
              type="email"
              name="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
              }}
              error={errors.email}
              placeholder="Enter your email"
              required
            />

            <button
              type="submit"
              className={`btn btn-primary btn-block btn-lg ${submitting ? 'btn-loading' : ''}`}
              disabled={!email || submitting}
              style={{ marginTop: 'var(--space-md)' }}
            >
              {submitting ? '' : 'Send Verification Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <FormInput
              label="Verification Code"
              type="text"
              name="code"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                if (errors.code) setErrors((prev) => ({ ...prev, code: null }));
              }}
              error={errors.code}
              placeholder="Enter 6-digit code"
              required
            />

            <FormInput
              label="New Password"
              type="password"
              name="newPassword"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (errors.newPassword) setErrors((prev) => ({ ...prev, newPassword: null }));
              }}
              error={errors.newPassword}
              placeholder="8-16 chars, 1 uppercase, 1 special char"
              required
            />

            <FormInput
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: null }));
              }}
              error={errors.confirmPassword}
              placeholder="Confirm new password"
              required
            />

            <button
              type="submit"
              className={`btn btn-primary btn-block btn-lg ${submitting ? 'btn-loading' : ''}`}
              disabled={!code || !newPassword || !confirmPassword || submitting}
              style={{ marginTop: 'var(--space-md)' }}
            >
              {submitting ? '' : 'Reset Password'}
            </button>
          </form>
        )}

        <div className="auth-footer">
          Remember your password? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
