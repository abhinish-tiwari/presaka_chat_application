export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+91[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

export const validateOTP = (otp: string): boolean => {
  return /^\d{6}$/.test(otp);
};

export const validateName = (name: string): boolean => {
  return Boolean(name && name.trim().length >= 1 && name.trim().length <= 100);
};

export const validateBio = (bio: string | undefined): boolean => {
  return !bio || bio.length <= 500;
};

export const validateMessage = (message: string): boolean => {
  return Boolean(message && message.trim().length > 0 && message.length <= 5000);
};

