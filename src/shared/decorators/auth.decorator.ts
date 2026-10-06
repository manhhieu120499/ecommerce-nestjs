import { SetMetadata } from '@nestjs/common';
import { ConditionGuardType } from '../types/auth.type.js';

export const USER_CAN_ACCESS = 'user_can_access';

export type AuthTypeDecoratorPayload = {
  authType: string[];
  options: { condition: ConditionGuardType };
};

export const Auth = (
  authType: string[],
  options?: { condition: ConditionGuardType },
) => {
  return SetMetadata(USER_CAN_ACCESS, { authType, options });
};
