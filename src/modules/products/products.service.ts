import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StockMovementType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../shared/redis/redis.service';
import { CreateProductDto } from './dto/create-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const productExists = await this.prisma.product.findUnique({
      where: {
        sku: createProductDto.sku,
      },
    });

    if (productExists) {
      throw new BadRequestException('SKU já cadastrado.');
    }

    return this.prisma.product.create({
      data: {
        name: createProductDto.name,
        sku: createProductDto.sku,
        minimumStock: createProductDto.minimumStock,
        active: true,
      },
    });
  }

  async findAll(filters: FilterProductDto) {
    const name = filters.name?.trim() || undefined;
    const sku = filters.sku?.trim() || undefined;
    const activeFilter = filters.active?.trim();

    // Converto o filtro recebido pela query string para boolean,
    // deixando undefined quando o cliente nao quiser filtrar por status ativo.
    const active =
      activeFilter === 'true'
        ? true
        : activeFilter === 'false'
          ? false
          : undefined;

    return this.prisma.product.findMany({
      where: {
        name: name
          ? {
              contains: name,
              mode: 'insensitive',
            }
          : undefined,
        sku: sku
          ? {
              contains: sku,
              mode: 'insensitive',
            }
          : undefined,
        active,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado.');
    }

    return product;
  }

  async inactivate(id: string) {
    const product = await this.findOne(id);

    if (!product.active) {
      throw new BadRequestException('Produto já está inativo.');
    }

    return this.prisma.product.update({
      where: {
        id,
      },
      data: {
        active: false,
      },
    });
  }

  async activate(id: string) {
    const product = await this.findOne(id);

    if (product.active) {
      throw new BadRequestException('Produto já está ativo.');
    }

    return this.prisma.product.update({
      where: {
        id,
      },
      data: {
        active: true,
      },
    });
  }

  async getStockBalance(id: string) {
    await this.findOne(id);

    const cacheKey = `stock-balance:${id}`;
    const cachedBalance = await this.redisService.get(cacheKey);

    if (cachedBalance !== null) {
      return {
        productId: id,
        balance: Number(cachedBalance),
        source: 'cache',
      };
    }

    // Quando nao encontro saldo em cache, recalculo pelo historico.
    // Assim o Redis ajuda na leitura, mas o banco continua sendo a fonte real.
    const movements = await this.prisma.stockMovement.findMany({
      where: {
        productId: id,
      },
      select: {
        type: true,
        quantity: true,
      },
    });

    const balance = movements.reduce((total, movement) => {
      if (movement.type === StockMovementType.IN) {
        return total + movement.quantity;
      }

      if (movement.type === StockMovementType.OUT) {
        return total - movement.quantity;
      }

      return total;
    }, 0);

    const ttl = Number(process.env.STOCK_BALANCE_CACHE_TTL || 60);

    await this.redisService.set(cacheKey, String(balance), ttl);

    return {
      productId: id,
      balance,
      source: 'database',
    };
  }
}
