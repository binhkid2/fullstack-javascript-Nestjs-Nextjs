export const passwordRules = {
  minLength: 8,
  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/,
};

export function getPasswordErrors(password: string) {
  const errors: string[] = [];

  if (password.length < passwordRules.minLength) {
    errors.push(`Password must be at least ${passwordRules.minLength} characters.`);
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must include a lowercase letter.');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must include an uppercase letter.');
  }
  if (!/\d/.test(password)) {
    errors.push('Password must include a number.');
  }
  if (!/[^A-Za-z\d]/.test(password)) {
    errors.push('Password must include a special character.');
  }

  return errors;
}
