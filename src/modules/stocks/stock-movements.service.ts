import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, StockMovementType, User, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../shared/redis/redis.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';

@Injectable()
export class StockMovementsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async create(data: CreateStockMovementDto, userId?: string) {
    const product = await this.prisma.product.findUnique({
      where: {
        id: data.productId,
      },
    });

    if (!product) {
      throw new NotFoundException('Produto nao encontrado.');
    }

    if (!product.active) {
      throw new BadRequestException(
        'Produto inativo nao pode receber movimentacao.',
      );
    }

    if (data.type === StockMovementType.OUT) {
      return this.createOutMovement(data, userId);
    }

    return this.createInMovement(data, userId);
  }

  private async createInMovement(
    data: CreateStockMovementDto,
    userId?: string,
  ) {
    const user = await this.getMovementUser(userId);

    const movement = await this.prisma.stockMovement.create({
      data: {
        productId: data.productId,
        userId: user.id,
        type: StockMovementType.IN,
        quantity: data.quantity,
      },
    });

    await this.invalidateStockBalance(data.productId);

    return movement;
  }

  private async createOutMovement(
    data: CreateStockMovementDto,
    userId?: string,
  ) {
    const movement = await this.prisma.$transaction(async (tx) => {
      const user = await this.getMovementUser(userId, tx);
      const currentBalance = await this.calculateBalance(data.productId, tx);

      if (data.quantity > currentBalance) {
        throw new BadRequestException(
          'Saida nao permitida. Quantidade maior que o saldo disponivel.',
        );
      }

      return tx.stockMovement.create({
        data: {
          productId: data.productId,
          userId: user.id,
          type: StockMovementType.OUT,
          quantity: data.quantity,
        },
      });
    });

    await this.invalidateStockBalance(data.productId);

    return movement;
  }

  private async calculateBalance(
    productId: string,
    prisma: Prisma.TransactionClient | PrismaService = this.prisma,
  ) {
    const movements = await prisma.stockMovement.findMany({
      where: {
        productId,
      },
      select: {
        type: true,
        quantity: true,
      },
    });

    return movements.reduce((balance, movement) => {
      if (movement.type === StockMovementType.IN) {
        return balance + movement.quantity;
      }

      if (movement.type === StockMovementType.OUT) {
        return balance - movement.quantity;
      }

      return balance;
    }, 0);
  }

  private async getSystemUser(
    prisma: Prisma.TransactionClient | PrismaService = this.prisma,
  ) {
    const systemUser = await prisma.user.findUnique({
      where: {
        email: 'operator@riopae.local',
      },
    });

    if (systemUser) {
      return systemUser;
    }

    const password = await bcrypt.hash('123456', 10);

    return prisma.user.create({
      data: {
        name: 'Operador RioPae',
        email: 'operator@riopae.local',
        password,
        role: UserRole.OPERATOR,
      },
    });
  }

  private async getMovementUser(
    userId?: string,
    prisma: Prisma.TransactionClient | PrismaService = this.prisma,
  ): Promise<User> {
    if (!userId) {
      return this.getSystemUser(prisma);
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new BadRequestException('Usuario autenticado nao encontrado.');
    }

    return user;
  }

  private async invalidateStockBalance(productId: string) {
    await this.redisService.del(`stock-balance:${productId}`);
  }
}
