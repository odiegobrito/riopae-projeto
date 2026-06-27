import { ApiProperty } from '@nestjs/swagger';
import { PurchaseRequestStatus } from '@prisma/client';

export class PurchaseRequestResponseDto {
  @ApiProperty({
    example: '5f8c47cc-6af8-4eb7-9f0d-fbbf542a6a72',
  })
  id: string;

  @ApiProperty({
    example: 'b783d378-f3c5-4d26-a0c8-773c6d44a1b5',
  })
  productId: string;

  @ApiProperty({
    example: 'a45ebc52-4f8a-4a13-9d5e-07a0d86ed432',
  })
  requestedById: string;

  @ApiProperty({
    example: PurchaseRequestStatus.PENDING,
    enum: PurchaseRequestStatus,
  })
  status: PurchaseRequestStatus;

  @ApiProperty({
    example: null,
    nullable: true,
  })
  rejectionReason: string | null;

  @ApiProperty({
    example: '2026-06-26T22:49:57.504Z',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2026-06-26T22:58:21.932Z',
  })
  updatedAt: Date;
}
