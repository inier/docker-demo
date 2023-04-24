import { Test, TestingModule } from '@nestjs/testing';
import { SeckillController } from './seckill.controller';

describe('SeckillController', () => {
  let controller: SeckillController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SeckillController],
    }).compile();

    controller = module.get<SeckillController>(SeckillController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
