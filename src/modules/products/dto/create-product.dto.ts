import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    example: 'Mouse Gamer',
    description: 'Nome do produto.',
  })
  @IsString()
  @IsNotEmpty({ message: 'O nome do produto é obrigatório.' })
  name: string;

  @ApiProperty({
    example: 'MOU001',
    description: 'Código único do produto no estoque.',
  })
  @IsString()
  @IsNotEmpty({ message: 'O SKU do produto é obrigatório.' })
  sku: string;

  @ApiProperty({
    example: 10,
    description: 'Quantidade mínima recomendada em estoque.',
    minimum: 0,
  })
  @IsInt({ message: 'O estoque mínimo deve ser um número inteiro.' })
  @Min(0, { message: 'O estoque mínimo não pode ser negativo.' })
  minimumStock: number;
}