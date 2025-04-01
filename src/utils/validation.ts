export const validateEmail = (email: string): string[] => {
  const errors: string[] = [];
  
  if (!email) {
    errors.push('Email is required');
    return errors;
  }

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errors.push('Please enter a valid email address');
  }

  // Check for common email providers
  const [, domain] = email.split('@');
  if (domain) {
    const commonProviders = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
    if (!commonProviders.includes(domain.toLowerCase()) && !domain.includes('.')) {
      errors.push('Please check your email domain');
    }
  }

  return errors;
};

export const validatePassword = (password: string): string[] => {
  const errors: string[] = [];
  
  if (!password) {
    errors.push('Password is required');
    return errors;
  }

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return errors;
};

export const validatePasswordMatch = (password: string, confirmPassword: string): string[] => {
  const errors: string[] = [];
  
  if (password !== confirmPassword) {
    errors.push('Passwords do not match');
  }

  return errors;
};

export const formatValidationErrors = (errors: string[]): string => {
  return errors.join(', ');
}; 