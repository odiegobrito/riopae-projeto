import { ApiProperty } from '@nestjs/swagger';

export class ProductResponseDto {
  @ApiProperty({
    example: 'b783d378-f3c5-4d26-a0c8-773c6d44a1b5',
  })
  id: string;

  @ApiProperty({
    example: 'Mouse Gamer',
  })
  name: string;

  @ApiProperty({
    example: 'MOU001',
  })
  sku: string;

  @ApiProperty({
    example: 10,
  })
  minimumStock: number;

  @ApiProperty({
    example: true,
    description: 'Indica se o produto esta ativo.',
  })
  status: boolean;

  @ApiProperty({
    example: '2026-06-26T22:49:57.504Z',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2026-06-26T22:58:21.932Z',
  })
  updatedAt: Date;
}
