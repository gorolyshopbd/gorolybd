const otps = new Map();

export const saveOTP = (target, otp, expiryMinutes = 5) => {
  const expiresAt = Date.now() + expiryMinutes * 60 * 1000;
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
    otps.delete(target);
  }
  return isValid;
};
