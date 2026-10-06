import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { envConfig } from '../configs/env.config.js';

const SECRET_API_KEY = envConfig.SECRET_KEY_API;

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const apiKey = request.headers[SECRET_API_KEY];

    if (!apiKey) throw new UnauthorizedException();

    return true;
  }
}
