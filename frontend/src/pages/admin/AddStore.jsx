import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import FormInput from '../../components/FormInput';
import {
  validateName,
  validateEmail,
  validateAddress,
} from '../../utils/validators';
import { FiArrowLeft, FiShoppingBag } from 'react-icons/fi';

function AddStore({ showToast }) {
  const navigate = useNavigate();
  const [storeOwners, setStoreOwners] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    ownerId: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchStoreOwners();
  }, []);

  const fetchStoreOwners = async () => {
    try {
      const response = await api.get('/users', { params: { role: 'store_owner' } });
      setStoreOwners(response.data.users || []);
    } catch (err) {
      // Silently fail, owner selection is optional
    }
  };

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

    if (nameErr) newErrors.name = nameErr;
    if (emailErr) newErrors.email = emailErr;
    if (addressErr) newErrors.address = addressErr;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        address: formData.address,
      };
      if (formData.ownerId) {
        payload.owner_id = formData.ownerId;
      }

      await api.post('/stores', payload);
      showToast('Store created successfully!', 'success');
      navigate('/admin/stores');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create store.';
      showToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid = formData.name && formData.email && formData.address;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
          <button className="btn btn-ghost" onClick={() => navigate('/admin/stores')}>
            <FiArrowLeft /> Back
          </button>
          <div>
            <h1>Add Store</h1>
            <p>Register a new store on the platform</p>
          </div>
        </div>
      </div>

      <div className="glass-card-static form-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
          <div className="stats-card-icon">
            <FiShoppingBag />
          </div>
          <h3>Store Information</h3>
        </div>

        <form onSubmit={handleSubmit}>
          <FormInput
            label="Store Name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="Enter store name (20-60 characters)"
            required
          />

          <FormInput
            label="Store Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="Enter store email address"
            required
          />

          <FormInput
            label="Store Address"
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            error={errors.address}
            placeholder="Enter store address (max 400 characters)"
            required
          />

          <div className="form-group">
            <label className="form-label">Owner (Optional)</label>
            <select
              name="ownerId"
              className="form-select"
              value={formData.ownerId}
              onChange={handleChange}
            >
              <option value="">No owner assigned</option>
              {storeOwners.map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.name} ({owner.email})
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className={`btn btn-primary btn-block btn-lg ${submitting ? 'btn-loading' : ''}`}
            disabled={!isFormValid || submitting}
            style={{ marginTop: 'var(--space-md)' }}
          >
            {submitting ? '' : 'Create Store'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddStore;
