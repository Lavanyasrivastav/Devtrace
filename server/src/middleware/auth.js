import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AuthenticationError } from '../utils/AppError.js';
import { User } from '../models/User.js';
import { catchAsync } from '../utils/catchAsync.js';

export const requireAuth = catchAsync(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw new AuthenticationError('No access token provided');
  }

  const token = header.split(' ')[1];
  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    throw new AuthenticationError('Invalid or expired access token');
  }

  const user = await User.findById(payload.sub);
  if (!user || !user.isActive) {
    throw new AuthenticationError('User no longer exists or is inactive');
  }

  req.user = user;
  next();
});
