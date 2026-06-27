import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { StockMovementType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../shared/redis/redis.service';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let service: ProductsService;
  let prisma: {
    product: {
      findUnique: jest.Mock;
      create: jest.Mock;
    };
    stockMovement: {
      findMany: jest.Mock;
    };
  };
  let redis: {
    get: jest.Mock;
    set: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      product: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      stockMovement: {
        findMany: jest.fn(),
      },
    };
    redis = {
      get: jest.fn(),
      set: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaService, useValue: prisma },
        { provide: RedisService, useValue: redis },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('cria produto com SKU unico', async () => {
    const product = {
      id: 'product-1',
      name: 'Mouse Gamer',
      sku: 'MOU001',
      minimumStock: 10,
      status: true,
    };

    prisma.product.findUnique.mockResolvedValue(null);
    prisma.product.create.mockResolvedValue(product);

    await expect(
      service.create({
        name: 'Mouse Gamer',
        sku: 'MOU001',
        minimumStock: 10,
      }),
    ).resolves.toEqual(product);

    expect(prisma.product.create).toHaveBeenCalledWith({
      data: {
        name: 'Mouse Gamer',
        sku: 'MOU001',
        minimumStock: 10,
        status: true,
      },
    });
  });

  it('bloqueia produto com SKU duplicado', async () => {
    prisma.product.findUnique.mockResolvedValue({
      id: 'product-1',
      sku: 'MOU001',
    });

    await expect(
      service.create({
        name: 'Mouse Gamer',
        sku: 'MOU001',
        minimumStock: 10,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(prisma.product.create).not.toHaveBeenCalled();
  });

  it('calcula saldo de estoque a partir das movimentacoes e grava cache', async () => {
    prisma.product.findUnique.mockResolvedValue({
      id: 'product-1',
      name: 'Mouse Gamer',
    });
    redis.get.mockResolvedValue(null);
    prisma.stockMovement.findMany.mockResolvedValue([
      { type: StockMovementType.IN, quantity: 10 },
      { type: StockMovementType.OUT, quantity: 3 },
      { type: StockMovementType.IN, quantity: 5 },
    ]);

    await expect(service.getStockBalance('product-1')).resolves.toEqual({
      productId: 'product-1',
      balance: 12,
      source: 'database',
    });

    expect(redis.set).toHaveBeenCalledWith('stock-balance:product-1', '12', 60);
  });
});
