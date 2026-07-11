import { Logger } from '@nestjs/common';

const logger = new Logger('JwtConfig');
const DEV_FALLBACK = 'dev-only-jwt-secret-change-me';

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (secret) {
    return secret;
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable is required in production');
  }
  logger.warn('JWT_SECRET not set — using development fallback. Set JWT_SECRET before deploying.');
  return DEV_FALLBACK;
}
