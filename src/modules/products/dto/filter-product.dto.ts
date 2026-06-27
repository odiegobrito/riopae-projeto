import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBooleanString, IsOptional, IsString } from 'class-validator';

export class FilterProductDto {
  @ApiPropertyOptional({
    example: 'Mouse',
    description: 'Filtra produtos pelo nome.',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'MOU001',
    description: 'Filtra produtos pelo SKU.',
  })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiPropertyOptional({
    example: 'true',
    description: 'Filtra produtos pelo campo active (true ou false).',
  })
  @IsOptional()
  @IsBooleanString()
  active?: string;

  @ApiPropertyOptional({
    example: 'true',
    description: 'Alias para active, mantendo o filtro por status do desafio.',
  })
  @IsOptional()
  @IsBooleanString()
  status?: string;
}
