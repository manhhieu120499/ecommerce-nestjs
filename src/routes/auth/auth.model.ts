import z from 'zod';
import {
  UserStatus,
  VerificationCodeConstant,
} from '../../shared/types/auth.type.js';

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

export const RegisterUserSchema = UserSchema.pick({
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
    code: z.string({ error: 'Code is required and string' }),
    type: z.enum(VerificationCodeConstant, {
      error: 'type must be REGISTER OR FORGOT_PASSWORD',
    }),
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

const VerificationCodeSchema = z.object({
  id: z.number({ error: 'id is required and number' }),
  email: z.email({ error: 'email is required and string' }),
  code: z.string({ error: 'code is required and string' }).min(6).max(50),
  type: z.nativeEnum(VerificationCodeConstant),
  expiresAt: z.date({ error: 'expiresAt is required and date' }),
  createdAt: z.date({ error: 'expiresAt is required and date' }),
});

export const CredentialSchema = UserSchema.pick({
  email: true,
  password: true,
}).strict();

export const SendOTPSchema = VerificationCodeSchema.pick({
  email: true,
  type: true,
}).strict();

export const ResendOTPSchema = VerificationCodeSchema.pick({
  email: true,
  type: true,
  code: true,
}).strict();

const CreateUserSchema = UserSchema.pick({
  email: true,
  password: true,
  name: true,
  phoneNumber: true,
  roleId: true,
}).strict();

export const CredentialResSchema = z
  .object({
    userId: z.number({ error: 'UserId is required and type number' }),
    email: z.email({ error: 'Email is required and type email' }),
    accessToken: z.string({ error: 'AccessToken is required and type string' }),
    refreshToken: z.string({
      error: 'AccessToken is required and type string',
    }),
  })
  .strict();

export type UserType = z.infer<typeof UserSchema>;
export type CreateUserType = z.infer<typeof CreateUserSchema>;
export type TokenType = z.infer<typeof TokenSchema>;
export type VerificationCodeType = z.infer<typeof VerificationCodeSchema>;
