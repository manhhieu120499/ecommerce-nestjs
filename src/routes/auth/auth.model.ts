import z from 'zod';
import { UserStatus } from '../../shared/types/auth.type.js';

const UserSchema = z
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

const RegisterUserSchema = UserSchema.pick({
  email: true,
  name: true,
  password: true,
  phoneNumber: true,
  roleId: true,
})
  .extend({
    confirmPassword: z
      .string({ error: 'Password is string' })
      .min(10, { error: 'Password must have greater than 10 character' }),
  })
  .strict()
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: 'custom',
        message: 'password and confirmPassword must be same',
        path: ['confirmPassword'],
      });
    }
  });

const TokenSchema = z.object({
  token: z.string({ error: 'Token is required and string' }),
  userId: z.number({ error: 'UserId is required and number' }),
  expiresAt: z.date({ error: 'Expired is required and after today' }),
});

export type UserType = z.infer<typeof UserSchema>;
export type RegisterUserType = z.infer<typeof RegisterUserSchema>;
export type TokenType = z.infer<typeof TokenSchema>;
