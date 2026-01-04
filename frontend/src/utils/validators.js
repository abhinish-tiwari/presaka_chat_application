export const validatePhone = (phone) => {
  const phoneRegex = /^\+91[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

export const validateOTP = (otp) => {
  return /^\d{6}$/.test(otp);
};

export const validateName = (name) => {
  return name && name.trim().length >= 1 && name.trim().length <= 100;
};

export const validateBio = (bio) => {
  return !bio || bio.length <= 500;
};

export const validateMessage = (message) => {
  return message && message.trim().length > 0 && message.length <= 5000;
};

