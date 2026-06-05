import jwt from 'jsonwebtoken';

export function generateToken(userId) {
  const secret = (process.env.JWT_SECRET || '').trim();
  const expiresIn = (process.env.JWT_EXPIRES_IN || '7d').trim();

  return jwt.sign({ id: userId }, secret, { expiresIn });
}