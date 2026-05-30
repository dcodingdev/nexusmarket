import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { RegisterInput, LoginInput } from '@repo/api-contracts';
import { UserRepository } from '../users/user.repository.js';
import { User } from '@repo/types';

import { env } from '../../config/env.js';
const ACCESS_SECRET = env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = env.JWT_REFRESH_SECRET;

const mapToUser = (user: any): User => ({
  _id: user._id.toString(),
  email: user.email,
  name: user.name,
  role: user.role,
  createdAt: user.createdAt,
});

// REGISTER
export const registerUser = async (data: RegisterInput): Promise<User> => {
  const hashedPassword = await bcrypt.hash(data.password, 10);

  // Overwrite the plain text password with the hashed one
  const user = await UserRepository.create({
    ...data,
    role: 'customer', // Force customer role for all public signups
    password: hashedPassword,
  });

  return mapToUser(user);
};

// LOGIN + TOKEN GENERATION
export const validateAndGenerateTokens = async (
  data: LoginInput
): Promise<{ user: User; accessToken: string; refreshToken: string }> => {
  const user = await UserRepository.findByEmail(data.email);

  if (!user || !user.password) {
    throw new Error('Invalid credentials');
  }

  const isValid = await bcrypt.compare(data.password, user.password);
  if (!isValid) {
    throw new Error('Invalid credentials');
  }

  if ((user as any).isSuspended) {
    throw new Error('Your account has been suspended');
  }

  const accessToken = jwt.sign(
    { _id: user._id.toString(), role: user.role, name: user.name,   
    email: user.email  },
    ACCESS_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { _id: user._id.toString(), role: user.role, name: user.name,   
    email: user.email  },
    REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return {
    user: mapToUser(user),
    accessToken,
    refreshToken,
  };
};

// REFRESH SESSION (Kept as is, added error handling)
export const refreshSession = async (
  token: string
): Promise<{ accessToken: string; newRefreshToken: string }> => {
  try {
    const decoded = jwt.verify(token, REFRESH_SECRET) as { _id: string };
    const user = await UserRepository.findById(decoded._id);

    if (!user) throw new Error('User not found');

    const accessToken = jwt.sign(
      { _id: user._id.toString(), role: user.role },
      ACCESS_SECRET,
      { expiresIn: '15m' }
    );

    const newRefreshToken = jwt.sign(
      { _id: user._id.toString() },
      REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    return { accessToken, newRefreshToken };
  } catch (err) {
    throw new Error('Invalid or expired refresh token');
  }
};