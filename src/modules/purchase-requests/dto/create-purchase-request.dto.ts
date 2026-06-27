import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePurchaseRequestDto {
  @ApiProperty({
    example: 'b783d378-f3c5-4d26-a0c8-773c6d44a1b5',
    description: 'ID do produto solicitado para compra.',
  })
  @IsString()
  @IsNotEmpty()
  productId: string;
}
