import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { StockMovementType, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../shared/redis/redis.service';
import { StockMovementsService } from './stock-movements.service';

describe('StockMovementsService', () => {
  let service: StockMovementsService;
  let prisma: {
    product: {
      findUnique: jest.Mock;
    };
    user: {
      findUnique: jest.Mock;
    };
    stockMovement: {
      findMany: jest.Mock;
      create: jest.Mock;
    };
    $transaction: jest.Mock;
  };
  let redis: {
    del: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      product: {
        findUnique: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
      stockMovement: {
        findMany: jest.fn(),
        create: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(prisma)),
    };
    redis = {
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockMovementsService,
        { provide: PrismaService, useValue: prisma },
        { provide: RedisService, useValue: redis },
      ],
    }).compile();

    service = module.get<StockMovementsService>(StockMovementsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('bloqueia saida maior que saldo disponivel', async () => {
    prisma.product.findUnique.mockResolvedValue({
      id: 'product-1',
      active: true,
    });
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      role: UserRole.OPERATOR,
    });
    prisma.stockMovement.findMany.mockResolvedValue([
      { type: StockMovementType.IN, quantity: 5 },
    ]);

    await expect(
      service.create(
        {
          productId: 'product-1',
          type: StockMovementType.OUT,
          quantity: 6,
        },
        'user-1',
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(prisma.stockMovement.create).not.toHaveBeenCalled();
    expect(redis.del).not.toHaveBeenCalled();
  });
});
