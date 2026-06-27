import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class AuthResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    example: {
      id: 'a45ebc52-4f8a-4a13-9d5e-07a0d86ed432',
      name: 'Operador RioPae',
      email: 'operator@riopae.local',
      role: UserRole.OPERATOR,
    },
  })
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
}
