import jwt from 'jsonwebtoken';

import { env } from './env.js';

const ACCESS_SECRET = env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = env.JWT_REFRESH_SECRET;

export const generateTokens = (payload: { id: string; role: string }) => {
  const accessToken = jwt.sign(payload, ACCESS_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string) => jwt.verify(token, ACCESS_SECRET);
export const verifyRefreshToken = (token: string) => jwt.verify(token, REFRESH_SECRET);