import z from 'zod';
import { UserStatus, VerificationCodeConstant } from '../types/auth.type.js';

export const UserSchema = z
  .object({
    id: z.number(),
    email: z.email({ error: 'Email is string' }),
    name: z.string({ error: 'Name is string' }),
    phoneNumber: z
      .string({ error: 'Phone number is string' })
      .min(10, { error: 'Phone number must have min 10 character' })
      .max(15, { error: 'Phone number must have max 15 character' }),
    avatar: z.string().nullable(),
    status: z.nativeEnum(UserStatus),
    roleId: z.number(),
    createdById: z.number().nullable(),
    updatedById: z.number().nullable(),
    deletedAt: z.date().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .extend({
    password: z
      .string({ error: 'Password is string' })
      .min(10, { error: 'Password must have greater than 10 character' }),
  });

const CreateUserSchema = UserSchema.pick({
  email: true,
  password: true,
  name: true,
  phoneNumber: true,
  roleId: true,
}).strict();

const VerificationCodeSchema = z.object({
  id: z.number({ error: 'id is required and number' }),
  email: z.email({ error: 'email is required and string' }),
  code: z.string({ error: 'code is required and string' }).min(6).max(50),
  type: z.nativeEnum(VerificationCodeConstant),
  expiresAt: z.date({ error: 'expiresAt is required and date' }),
  createdAt: z.date({ error: 'expiresAt is required and date' }),
});

export type UserType = z.infer<typeof UserSchema>;
export type CreateUserType = z.infer<typeof CreateUserSchema>;
export type VerificationCodeType = z.infer<typeof VerificationCodeSchema>;
