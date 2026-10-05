function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required' };
  }

  const minLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (hasUpper) score++;
  if (hasLower) score++;
  if (hasNumber) score++;
  if (hasSpecial) score++;

  let strength = 'Weak';
  if (score >= 5) strength = 'Very Strong';
  else if (score >= 4) strength = 'Strong';
  else if (score >= 3) strength = 'Medium';

  const valid = minLength && hasUpper && hasLower && hasNumber && hasSpecial;
  const message = valid
    ? 'Password meets security requirements'
    : 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character';

  return { valid, strength, score, message };
}

function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

function validatePhone(phone) {
  if (!phone) return true; // optional
  const phoneClean = phone.replace(/[\s\-\(\)\+]/g, '');
  return phoneClean.length >= 7 && phoneClean.length <= 15;
}

function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  return str.trim();
}

module.exports = {
  validatePassword,
  validateEmail,
  validatePhone,
  sanitizeString,
};
