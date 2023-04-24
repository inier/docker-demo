import { Test, TestingModule } from '@nestjs/testing';
import { SeckillService } from './seckill.service';

describe('SeckillService', () => {
  let service: SeckillService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SeckillService],
    }).compile();

    service = module.get<SeckillService>(SeckillService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
