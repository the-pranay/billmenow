import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
};

export const generateResetToken = () => {
  return jwt.sign({ type: 'reset' }, JWT_SECRET, { expiresIn: '1h' });
};

export const generateEmailVerificationToken = (email) => {
  return jwt.sign({ email, type: 'email_verification' }, JWT_SECRET, { expiresIn: '24h' });
};

// Add authenticateUser function for API route authentication
export const authenticateUser = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No valid authorization header provided');
  }
  
  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  const decoded = verifyToken(token);
  
  if (!decoded) {
    throw new Error('Invalid or expired token');
  }
  
  return decoded;
};
