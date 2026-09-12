import { User } from '../models/User.js';
import bcrypt from 'bcryptjs';
import { catchAsync } from '../utils/catchAsync.js';
import { success } from '../utils/apiResponse.js';
import { AuthenticationError, ConflictError } from '../utils/AppError.js';
import {
  signAccessToken,
  issueRefreshToken,
  verifyAndRotateRefreshToken,
  revokeAllUserTokens,
} from '../services/tokenService.js';
import { env } from '../config/env.js';

const REFRESH_COOKIE_NAME = 'devtrace_refresh';

function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: env.isProd ? 'strict' : 'lax',
    domain: env.cookieDomain,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: '/api/auth',
  });
}

export const register = catchAsync(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new ConflictError('An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash });

  const accessToken = signAccessToken(user);
  const refreshToken = await issueRefreshToken(user, req.ip);
  setRefreshCookie(res, refreshToken);

  return success(res, {
    statusCode: 201,
    message: 'Account created',
    data: { user: user.toSafeObject(), accessToken },
  });
});

export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !(await user.comparePassword(password))) {
    throw new AuthenticationError('Invalid email or password');
  }
  if (!user.isActive) {
    throw new AuthenticationError('This account has been deactivated');
  }

  const accessToken = signAccessToken(user);
  const refreshToken = await issueRefreshToken(user, req.ip);
  setRefreshCookie(res, refreshToken);

  return success(res, {
    message: 'Logged in',
    data: { user: user.toSafeObject(), accessToken },
  });
});

export const refresh = catchAsync(async (req, res) => {
  const rawToken = req.cookies[REFRESH_COOKIE_NAME];
  if (!rawToken) {
    throw new AuthenticationError('No refresh token provided');
  }

  let userId;
  try {
    userId = await verifyAndRotateRefreshToken(rawToken, req.ip);
  } catch {
    res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' });
    throw new AuthenticationError('Session expired, please log in again');
  }

  const user = await User.findById(userId);
  if (!user || !user.isActive) {
    throw new AuthenticationError('User no longer exists or is inactive');
  }

  const accessToken = signAccessToken(user);
  const newRefreshToken = await issueRefreshToken(user, req.ip);
  setRefreshCookie(res, newRefreshToken);

  return success(res, {
    message: 'Token refreshed',
    data: { accessToken },
  });
});

export const logout = catchAsync(async (req, res) => {
  const rawToken = req.cookies[REFRESH_COOKIE_NAME];
  if (rawToken) {
    try {
      const userId = await verifyAndRotateRefreshToken(rawToken, req.ip);
      await revokeAllUserTokens(userId);
    } catch {
      // Token already invalid/expired.
    }
  }
  res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' });
  return success(res, { message: 'Logged out' });
});

export const me = catchAsync(async (req, res) => {
  return success(res, { message: 'Current user', data: { user: req.user.toSafeObject() } });
});
