// In-memory OTP storage mapping target (email/phone) to verification codes
const otps = new Map();

export const saveOTP = (target, otp) => {
  // Expires in 5 minutes
  const expiresAt = Date.now() + 5 * 60 * 1000;
  otps.set(target, { otp, expiresAt });
};

export const verifyOTP = (target, otp) => {
  const record = otps.get(target);
  if (!record) return false;

  if (Date.now() > record.expiresAt) {
    otps.delete(target);
    return false;
  }

  const isValid = record.otp === otp;
  if (isValid) {
    otps.delete(target); // Consume OTP once validated
  }
  return isValid;
};
