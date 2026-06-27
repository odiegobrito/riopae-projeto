import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RejectPurchaseRequestDto {
  @ApiProperty({
    example: 'Solicitacao duplicada ou sem necessidade no momento.',
  })
  @IsString()
  @IsNotEmpty({ message: 'O motivo da rejeicao e obrigatorio.' })
  rejectionReason: string;
}
