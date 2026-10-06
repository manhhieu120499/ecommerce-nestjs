import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/services/prisma.service.js';
import { RoleName } from '../../shared/constants/roles.constant.js';

@Injectable()
export class RoleService {
  private clientRoleId: number | null;

  constructor(private readonly prismaService: PrismaService) {}

  async getCacheRoleId() {
    if (this.clientRoleId) return this.clientRoleId;

    const defaultRole = await this.prismaService.role.findUniqueOrThrow({
      where: {
        name: RoleName.Client,
      },
    });

    this.clientRoleId = defaultRole.id;

    return defaultRole.id;
  }
}
