function FormInput({
  label,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  name,
  disabled = false,
  required = false,
}) {
  return (
    <div className="form-group">
      {label && (
        <label className="form-label" htmlFor={name}>
          {label}
          {required && <span style={{ color: 'var(--error)', marginLeft: '4px' }}>*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`form-input ${error ? 'error' : ''}`}
        autoComplete={type === 'password' ? 'current-password' : 'off'}
      />
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}

export default FormInput;
