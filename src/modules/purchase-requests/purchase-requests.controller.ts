import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthUser } from '../auth/types/auth-user.type';
import { CreatePurchaseRequestDto } from './dto/create-purchase-request.dto';
import { PurchaseRequestResponseDto } from './dto/purchase-request-response.dto';
import { RejectPurchaseRequestDto } from './dto/reject-purchase-request.dto';
import { PurchaseRequestsService } from './purchase-requests.service';

@ApiTags('Purchase Requests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('purchase-requests')
export class PurchaseRequestsController {
  constructor(
    private readonly purchaseRequestsService: PurchaseRequestsService,
  ) {}

  @Post()
  @Roles(UserRole.OPERATOR, UserRole.MANAGER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Criar solicitacao de compra' })
  @ApiCreatedResponse({
    description: 'Solicitacao criada com status PENDING.',
    type: PurchaseRequestResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Ja existe solicitacao PENDING para o produto.',
  })
  @ApiResponse({
    status: 404,
    description: 'Produto nao encontrado.',
  })
  create(
    @Body() createPurchaseRequestDto: CreatePurchaseRequestDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.purchaseRequestsService.create(
      createPurchaseRequestDto,
      user.id,
    );
  }

  @Patch(':id/approve')
  @Roles(UserRole.MANAGER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Aprovar solicitacao de compra' })
  @ApiOkResponse({
    description: 'Solicitacao aprovada com sucesso.',
    type: PurchaseRequestResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Somente solicitacoes PENDING podem ser aprovadas.',
  })
  @ApiResponse({
    status: 404,
    description: 'Solicitacao de compra nao encontrada.',
  })
  approve(@Param('id') id: string) {
    return this.purchaseRequestsService.approve(id);
  }

  @Patch(':id/reject')
  @Roles(UserRole.MANAGER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Rejeitar solicitacao de compra' })
  @ApiOkResponse({
    description: 'Solicitacao rejeitada com sucesso.',
    type: PurchaseRequestResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Somente solicitacoes PENDING podem ser rejeitadas.',
  })
  @ApiResponse({
    status: 404,
    description: 'Solicitacao de compra nao encontrada.',
  })
  reject(
    @Param('id') id: string,
    @Body() rejectPurchaseRequestDto: RejectPurchaseRequestDto,
  ) {
    return this.purchaseRequestsService.reject(id, rejectPurchaseRequestDto);
  }
}
