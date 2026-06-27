import { ApiProperty } from '@nestjs/swagger';
import { StockMovementType } from '@prisma/client';
import { IsIn, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

const ALLOWED_STOCK_MOVEMENT_TYPES = [
  StockMovementType.IN,
  StockMovementType.OUT,
] as const;

export class CreateStockMovementDto {
  @ApiProperty({
    example: 'uuid-do-produto',
    description: 'ID do produto que será movimentado.',
  })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    example: 'IN',
    enum: ALLOWED_STOCK_MOVEMENT_TYPES,
    description: 'Tipo da movimentação. Valores permitidos: IN ou OUT.',
  })
  @IsIn(ALLOWED_STOCK_MOVEMENT_TYPES, {
    message: 'O tipo da movimentação deve ser IN ou OUT.',
  })
  type: StockMovementType;

  @ApiProperty({
    example: 5,
    description: 'Quantidade movimentada. Deve ser maior que zero.',
  })
  @IsInt()
  @Min(1, { message: 'A quantidade deve ser maior que zero.' })
  quantity: number;
}
