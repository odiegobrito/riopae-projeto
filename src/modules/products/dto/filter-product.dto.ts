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
    description: 'Filtra produtos pelo status (true ou false).',
  })
  @IsOptional()
  @IsBooleanString()
  status?: string;
}
