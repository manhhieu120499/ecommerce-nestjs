import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { randomInt } from 'crypto';

export function isUniqueConstraintError(
  error: unknown,
): error is PrismaClientKnownRequestError {
  return (
    error instanceof PrismaClientKnownRequestError && error.code === 'P2002'
  );
}

export function isNotFoundRecordError(
  error: unknown,
): error is PrismaClientKnownRequestError {
  return (
    error instanceof PrismaClientKnownRequestError && error.code === 'P2025'
  );
}

export function generateOTP(min?: number, max?: number): string {
  let defaultMin = min ?? 100000;
  let defaultMax = max ?? 1000000;
  return String(randomInt(defaultMin, defaultMax));
}
