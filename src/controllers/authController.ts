import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Subscription from '../models/Subscription';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, preferredLang } = req.body;
  if (!name || !email || !password) throw new ApiError(400, 'All fields are required');

  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(400, 'User already exists');

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash, preferredLang: preferredLang || 'en' });

  // const payload = { id: user._id, email: user.email };
  // const accessToken = await generateAccessToken(payload);
  // const refreshToken = await generateRefreshToken(payload);

  res.status(201).json(new ApiResponse(201, {
    user: { id: user._id, name: user.name, email: user.email, preferredLang: user.preferredLang }
  }, 'User registered successfully'));
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(401, 'Invalid credentials');

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) throw new ApiError(401, 'Invalid credentials');

  const payload = { id: user._id, email: user.email };
  const accessToken = await generateAccessToken(payload);
  const refreshToken = await generateRefreshToken(payload);

  res.status(200).json(new ApiResponse(200, {
    user: { id: user._id, name: user.name, email: user.email, preferredLang: user.preferredLang },
    accessToken,
    refreshToken
  }, 'Login successful'));
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    throw new ApiError(401, 'No refresh token provided');
  }

  const decoded = await verifyRefreshToken(refreshToken) as any;
  if (!decoded) {
    throw new ApiError(401, 'Invalid refresh token');
  }

  const payload = { id: decoded.id, email: decoded.email };
  const newAccessToken = await generateAccessToken(payload);

  res.status(200).json(new ApiResponse(200, { accessToken: newAccessToken }, 'Token refreshed'));
});

export const whoami = asyncHandler(async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user?.id;
  const user = await User.findById(userId).select('-passwordHash');
  if (!user) throw new ApiError(404, 'User not found');

  const now = Date.now();
  const trialStart = user.trialStartDate ? user.trialStartDate.getTime() : now;
  const trialDurationMs = 7 * 24 * 60 * 60 * 1000;
  let trialExpired = now - trialStart > trialDurationMs;

  const sub = await Subscription.findOne({ userId });
  const expiry = sub?.expiryDate?.getTime() ?? 0;
  const subAlive = expiry > now;
  const hasActiveSub = Boolean(sub && sub.paymentStatus === 'active' && subAlive)
  const statusPending = Boolean(sub && sub.paymentStatus === 'pending' && subAlive)
  
  if (hasActiveSub || statusPending) {
    trialExpired = false;
  }

  res.status(200).json(new ApiResponse(200, {
    ...user.toObject(),
    trialExpired,
    hasActiveSub,
    statusPending
  }, 'User fetched successfully'));
});
