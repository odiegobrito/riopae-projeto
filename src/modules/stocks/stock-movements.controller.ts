import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
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
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { StockMovementsService } from './stock-movements.service';

@ApiTags('Stock Movements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('stock-movements')
export class StockMovementsController {
  constructor(private readonly stockMovementsService: StockMovementsService) {}

  @Post()
  @Roles(UserRole.OPERATOR, UserRole.MANAGER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Registrar movimentacao de estoque' })
  @ApiResponse({
    status: 201,
    description: 'Movimentacao registrada com sucesso.',
  })
  @ApiResponse({
    status: 400,
    description: 'Produto inativo, quantidade invalida ou saldo insuficiente.',
  })
  @ApiResponse({
    status: 404,
    description: 'Produto nao encontrado.',
  })
  create(
    @Body() createStockMovementDto: CreateStockMovementDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.stockMovementsService.create(createStockMovementDto, user.id);
  }
}
