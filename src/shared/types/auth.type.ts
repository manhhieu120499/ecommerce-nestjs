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

export type AuthType = (typeof AuthTypeConstant)[keyof typeof AuthTypeConstant];
export type ConditionGuardType =
  (typeof ConditionGuard)[keyof typeof ConditionGuard];
