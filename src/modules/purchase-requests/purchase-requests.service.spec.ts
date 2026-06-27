import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { PurchaseRequestsService } from './purchase-requests.service';

describe('PurchaseRequestsService', () => {
  let service: PurchaseRequestsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchaseRequestsService,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    service = module.get<PurchaseRequestsService>(PurchaseRequestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
