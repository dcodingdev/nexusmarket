import { Request, Response } from 'express';
import * as AuthService from './auth.service.js';
import { env } from '../../config/env.js';

const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const register = async (req: Request, res: Response) => {
  try {
    const user = await AuthService.registerUser(req.body);
    res.status(201).json({ user });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(409).json({ 
        message: 'Email already exists.' 
      });
    }
    console.error("REGISTRATION ERROR:", error);
    res.status(400).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { user, accessToken, refreshToken } = await AuthService.validateAndGenerateTokens(req.body);
    
    res.cookie('refreshToken', refreshToken, cookieOptions);
    res.json({ user, accessToken });
  } catch (error: any) {
    // Log the actual reason in the console for the developer
    console.warn(`Login failed for ${req.body.email}: ${error.message}`);
    res.status(401).json({ message: 'Authentication failed' });
  }
};

export const refresh = async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: 'No refresh token' });

  try {
    const { accessToken, newRefreshToken } = await AuthService.refreshSession(token);
    res.cookie('refreshToken', newRefreshToken, cookieOptions);
    res.json({ accessToken });
  } catch (error) {
    res.status(403).json({ message: 'Invalid refresh token' });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie('refreshToken', cookieOptions);
  res.json({ message: 'Logged out successfully' });
};