import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  it('bloqueia aprovacao por usuario sem permissao', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue([UserRole.MANAGER]),
    } as unknown as Reflector;

    const guard = new RolesGuard(reflector);
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({
          user: {
            id: 'user-1',
            email: 'operator@riopae.local',
            role: UserRole.OPERATOR,
          },
        }),
      }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(context)).toBe(false);
  });
});
