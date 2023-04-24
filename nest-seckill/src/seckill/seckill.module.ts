import { Logger, Module, OnApplicationBootstrap } from '@nestjs/common';
import * as Redis from 'ioredis';
import { awaitWrap } from '@/utils';
import { CreateOrderDTO } from '../order/order.dto';
import { OrderModule } from '../order/order.module';
import { OrderService } from '../order/order.service';
import { RedisClientService } from '../redis/redis.service';
import { getKafkaConsumer } from './kafka-utils';
import { SeckillController } from './seckill.controller';
import { SeckillService } from './seckill.service';
import { getConfig } from '@root/config';

const { kafkaConfig } = getConfig();

@Module({
  imports: [OrderModule],
  providers: [RedisClientService, SeckillService],
  controllers: [SeckillController],
})
export class SeckillModule implements OnApplicationBootstrap {
  logger = new Logger('SeckillModule');
  seckillRedisClient!: Redis.Redis;

  constructor(
    private readonly orderService: OrderService, //处理订单的Service
    private readonly seckillService: SeckillService, //秒杀相关实现
    private readonly redisClientService: RedisClientService, //redis连接
  ) {
    this.redisClientService.getSeckillRedisClient().then((client) => {
      this.seckillRedisClient = client;
    });
  }

  async handleListenerKafkaMessage() {
    const kafkaConsumer = getKafkaConsumer(); //抽取出创建消费者实现方法为函数

    kafkaConsumer.on('message', async (message) => {
      this.logger.log('得到的生产者的数据为：');
      this.logger.verbose(message);

      let order!: CreateOrderDTO; // 从kafka队列得到的订单数据，即service里producer.send的messages内容

      if (typeof message.value === 'string') {
        order = JSON.parse(message.value);
      } else {
        order = JSON.parse(message.value.toString());
      }

      // 写入数据库，完成订单创建
      const [err, order] = await awaitWrap(this.orderService.saveOne(value));
      if (err) {
        this.logger.error(err);
        return;
      }
      this.logger.log(`订单【${order.id}】信息已存入数据库`);
    });
  }

  async onApplicationBootstrap() {
    this.logger.log('onApplicationBootstrap: ');
    await this.seckillService.initCount(); //重置redis里商品剩余库存数
    this.handleListenerKafkaMessage();
  }
}
