import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import {
  AuthType,
  AuthTypeConstant,
  ConditionGuard,
} from '../types/auth.type.js';
import { AccessTokenGuard } from './access-token.guard.js';
import { ApiKeyGuard } from './api-key.guard.js';
import { Reflector } from '@nestjs/core';
import {
  AuthTypeDecoratorPayload,
  USER_CAN_ACCESS,
} from '../decorators/auth.decorator.js';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private guardMaps: Record<string, CanActivate>;
  constructor(
    private readonly accessTokenGuard: AccessTokenGuard,
    private readonly apiKeyGuard: ApiKeyGuard,
    private readonly reflector: Reflector,
  ) {
    this.guardMaps = {
      [AuthTypeConstant.Bearer]: this.accessTokenGuard,
      [AuthTypeConstant.ApiKey]: this.apiKeyGuard,
      [AuthTypeConstant.None]: { canActivate: () => true },
    };
  }
  canActivate(context: ExecutionContext): boolean {
    const authGuard = this.reflector.getAllAndOverride<
      AuthTypeDecoratorPayload | undefined
    >(USER_CAN_ACCESS, [context.getHandler(), context.getClass()]) ?? {
      authType: [AuthTypeConstant.None],
      options: { condition: ConditionGuard.And },
    };

    const guards = authGuard.authType.map(
      (authType) => this.guardMaps[authType],
    );

    if (authGuard.options.condition === ConditionGuard.Or) {
      for (const guard of guards) {
        const canActive = guard.canActivate(context);

        if (!canActive) return false;
      }
    } else if (authGuard.options.condition === ConditionGuard.And) {
      let flag = true;
      for (const guard of guards) {
        const canActive = guard.canActivate(context);

        if (!canActive) flag = false;
      }

      return flag;
    } else {
      return true;
    }

    return false;
  }
}
