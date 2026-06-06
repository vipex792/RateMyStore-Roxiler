export function validateName(name) {
  if (!name || name.trim().length === 0) {
    return 'Name is required';
  }
  if (name.trim().length < 20) {
    return 'Name must be at least 20 characters';
  }
  if (name.trim().length > 60) {
    return 'Name must be at most 60 characters';
  }
  return null;
}

export function validateEmail(email) {
  if (!email || email.trim().length === 0) {
    return 'Email is required';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return 'Please enter a valid email address';
  }
  return null;
}

export function validatePassword(password) {
  if (!password || password.length === 0) {
    return 'Password is required';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  if (password.length > 16) {
    return 'Password must be at most 16 characters';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least 1 uppercase letter';
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return 'Password must contain at least 1 special character';
  }
  return null;
}

export function validateAddress(address) {
  if (!address || address.trim().length === 0) {
    return 'Address is required';
  }
  if (address.trim().length > 400) {
    return 'Address must be at most 400 characters';
  }
  return null;
}

export function validateConfirmPassword(password, confirmPassword) {
  if (!confirmPassword || confirmPassword.length === 0) {
    return 'Please confirm your password';
  }
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  return null;
}
