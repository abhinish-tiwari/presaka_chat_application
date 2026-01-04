import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export const generateOTP = () => {
  const length = parseInt(process.env.OTP_LENGTH) || 6;
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return Math.floor(min + Math.random() * (max - min + 1)).toString();
};

export const hashOTP = async (otp) => {
  const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
  return await bcrypt.hash(otp, rounds);
};

export const verifyOTP = async (otp, hash) => {
  return await bcrypt.compare(otp, hash);
};

export const generateRequestId = () => {
  return `req_${uuidv4()}`;
};

