import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProductsModule } from './modules/products/products.module';
import { UsersModule } from './modules/users/users.module';
import { PurchaseRequestsModule } from './modules/purchase-requests/purchase-requests.module';
import { StockMovementsModule } from './modules/stocks/stock-movements.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    PurchaseRequestsModule,
    StockMovementsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
