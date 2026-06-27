import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
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
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { StockBalanceResponseDto } from './dto/stock-balance-response.dto';
import { ProductsService } from './products.service';

@ApiTags('Products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles(UserRole.OPERATOR, UserRole.MANAGER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Criar um produto' })
  @ApiCreatedResponse({
    description: 'Produto criado com sucesso.',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'SKU ja cadastrado ou dados invalidos.',
  })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @Roles(UserRole.OPERATOR, UserRole.MANAGER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar produtos' })
  @ApiOkResponse({
    description: 'Lista de produtos retornada com sucesso.',
    type: ProductResponseDto,
    isArray: true,
  })
  findAll(@Query() filters: FilterProductDto) {
    return this.productsService.findAll(filters);
  }

  @Get(':id/stock-balance')
  @Roles(UserRole.OPERATOR, UserRole.MANAGER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Consultar saldo atual do produto com cache Redis' })
  @ApiOkResponse({
    description: 'Saldo retornado com sucesso.',
    type: StockBalanceResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Produto nao encontrado.',
  })
  getStockBalance(@Param('id') id: string) {
    return this.productsService.getStockBalance(id);
  }

  @Get(':id')
  @Roles(UserRole.OPERATOR, UserRole.MANAGER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Buscar produto por ID' })
  @ApiOkResponse({
    description: 'Produto encontrado com sucesso.',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Produto nao encontrado.',
  })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id/inactivate')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Inativar produto' })
  @ApiOkResponse({
    description: 'Produto inativado com sucesso.',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Produto nao encontrado.',
  })
  @ApiResponse({
    status: 400,
    description: 'Produto ja esta inativo.',
  })
  inactivate(@Param('id') id: string) {
    return this.productsService.inactivate(id);
  }

  @Patch(':id/activate')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Ativar produto' })
  @ApiOkResponse({
    description: 'Produto ativado com sucesso.',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Produto nao encontrado.',
  })
  @ApiResponse({
    status: 400,
    description: 'Produto ja esta ativo.',
  })
  activate(@Param('id') id: string) {
    return this.productsService.activate(id);
  }
}
