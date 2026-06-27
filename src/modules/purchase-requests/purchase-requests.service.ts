import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PurchaseRequestStatus, User, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePurchaseRequestDto } from './dto/create-purchase-request.dto';
import { RejectPurchaseRequestDto } from './dto/reject-purchase-request.dto';

@Injectable()
export class PurchaseRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreatePurchaseRequestDto, userId?: string) {
    const product = await this.prisma.product.findUnique({
      where: {
        id: data.productId,
      },
    });

    if (!product) {
      throw new NotFoundException('Produto nao encontrado.');
    }

    // A regra do desafio nao permite duas solicitacoes pendentes
    // para o mesmo produto, entao eu barro antes de criar.
    const pendingRequest = await this.prisma.purchaseRequest.findFirst({
      where: {
        productId: data.productId,
        status: PurchaseRequestStatus.PENDING,
      },
    });

    if (pendingRequest) {
      throw new BadRequestException(
        'Ja existe uma solicitacao PENDING para este produto.',
      );
    }

    const requester = await this.getRequester(userId);

    return this.prisma.purchaseRequest.create({
      data: {
        productId: data.productId,
        requestedById: requester.id,
        status: PurchaseRequestStatus.PENDING,
      },
    });
  }

  async approve(id: string) {
    const purchaseRequest = await this.findOne(id);

    // Depois que uma solicitacao sai de PENDING, ela nao pode mudar de status.
    if (purchaseRequest.status !== PurchaseRequestStatus.PENDING) {
      throw new BadRequestException(
        'Somente solicitacoes PENDING podem ser aprovadas.',
      );
    }

    return this.prisma.purchaseRequest.update({
      where: {
        id,
      },
      data: {
        status: PurchaseRequestStatus.APPROVED,
        rejectionReason: null,
      },
    });
  }

  async reject(id: string, data: RejectPurchaseRequestDto) {
    const purchaseRequest = await this.findOne(id);
    const rejectionReason = data.rejectionReason.trim();

    if (purchaseRequest.status !== PurchaseRequestStatus.PENDING) {
      throw new BadRequestException(
        'Somente solicitacoes PENDING podem ser rejeitadas.',
      );
    }

    if (!rejectionReason) {
      throw new BadRequestException('O motivo da rejeicao e obrigatorio.');
    }

    return this.prisma.purchaseRequest.update({
      where: {
        id,
      },
      data: {
        status: PurchaseRequestStatus.REJECTED,
        rejectionReason,
      },
    });
  }

  private async findOne(id: string) {
    const purchaseRequest = await this.prisma.purchaseRequest.findUnique({
      where: {
        id,
      },
    });

    if (!purchaseRequest) {
      throw new NotFoundException('Solicitacao de compra nao encontrada.');
    }

    return purchaseRequest;
  }

  private async getSystemRequester() {
    const requester = await this.prisma.user.findUnique({
      where: {
        email: 'operator@riopae.local',
      },
    });

    if (requester) {
      return requester;
    }

    const password = await bcrypt.hash('123456', 10);

    return this.prisma.user.create({
      data: {
        name: 'Operador RioPae',
        email: 'operator@riopae.local',
        password,
        role: UserRole.OPERATOR,
      },
    });
  }

  private async getRequester(userId?: string): Promise<User> {
    if (!userId) {
      return this.getSystemRequester();
    }

    const requester = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!requester) {
      throw new BadRequestException('Usuario autenticado nao encontrado.');
    }

    return requester;
  }
}
