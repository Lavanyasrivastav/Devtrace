import crypto from 'crypto';
import { env } from '../config/env.js';

// Format: dvt_<env-tag>_<32 hex chars>. The prefix (first ~16 chars) is stored
// in plaintext for display in the UI ("dvt_live_ab12cd34...") so users can
// recognize which key is which without us ever storing the full secret.
export function generateApiKey() {
  const envTag = env.isProd ? 'live' : 'test';
  const secret = crypto.randomBytes(24).toString('hex');
  const fullKey = `dvt_${envTag}_${secret}`;
  const prefix = `${fullKey.slice(0, 16)}...`;
  const hash = hashApiKey(fullKey);
  return { fullKey, prefix, hash };
}

export function hashApiKey(key) {
  return crypto.createHash('sha256').update(key).digest('hex');
}
