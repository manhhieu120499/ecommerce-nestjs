import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';

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
