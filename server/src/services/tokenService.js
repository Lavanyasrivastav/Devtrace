import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env.js';
import { RefreshToken } from '../models/RefreshToken.js';

export function signAccessToken(user) {
  return jwt.sign({ sub: user._id.toString() }, env.jwtSecret, {
    expiresIn: env.jwtAccessExpiry,
  });
}

export function signRefreshToken(user) {
  return jwt.sign({ sub: user._id.toString() }, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiry,
  });
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function expiryDateFromNow(days = 30) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

export async function issueRefreshToken(user, ip) {
  const token = signRefreshToken(user);
  await RefreshToken.create({
    user: user._id,
    tokenHash: hashToken(token),
    expiresAt: expiryDateFromNow(30),
    createdByIp: ip,
  });
  return token;
}

export async function verifyAndRotateRefreshToken(rawToken, ip) {
  const payload = jwt.verify(rawToken, env.jwtRefreshSecret);
  const tokenHash = hashToken(rawToken);

  const stored = await RefreshToken.findOne({ user: payload.sub, tokenHash });
  if (!stored || stored.revoked) {
    throw new Error('Refresh token not recognized or already revoked');
  }

  stored.revoked = true;
  stored.revokedAt = new Date();
  await stored.save();

  return payload.sub;
}

export async function revokeAllUserTokens(userId) {
  await RefreshToken.updateMany({ user: userId, revoked: false }, { revoked: true, revokedAt: new Date() });
}

export { hashToken };
