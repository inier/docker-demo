import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SeckillModule } from './seckill/seckill.module';
import { RedisService } from './redis/redis.service';

@Module({
  imports: [SeckillModule],
  controllers: [AppController],
  providers: [AppService, RedisService],
})
export class AppModule {}
