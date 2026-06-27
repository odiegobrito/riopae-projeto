import { ApiProperty } from '@nestjs/swagger';

export class StockBalanceResponseDto {
  @ApiProperty({
    example: 'b783d378-f3c5-4d26-a0c8-773c6d44a1b5',
  })
  productId: string;

  @ApiProperty({
    example: 15,
  })
  balance: number;

  @ApiProperty({
    example: 'cache',
    enum: ['cache', 'database'],
  })
  source: 'cache' | 'database';
}
