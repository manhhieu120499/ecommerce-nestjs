export const AuthTypeConstant = {
  Bearer: 'Bearer',
  ApiKey: 'ApiKey',
  None: 'None',
} as const;

export const ConditionGuard = {
  And: 'and',
  Or: 'or',
} as const;

export const UserStatus = {
  ACTIVE: 'ACTIVE',
  BLOCKED: 'BLOCKED',
  INACTIVE: 'INACTIVE',
} as const;

export const VerificationCodeConstant = {
  REGISTER: 'REGISTER',
  FORGOT_PASSWORD: 'FORGOT_PASSWORD',
} as const;

export type AuthType = (typeof AuthTypeConstant)[keyof typeof AuthTypeConstant];
export type ConditionGuardType =
  (typeof ConditionGuard)[keyof typeof ConditionGuard];
export type VerificationCodeTypeConstant =
  (typeof VerificationCodeConstant)[keyof typeof VerificationCodeConstant];
