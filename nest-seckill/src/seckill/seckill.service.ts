import { Injectable, Logger } from '@nestjs/common';
import * as kafka from 'kafka-node';
import * as Redis from 'ioredis';
import { RedisClientService } from '../redis/redis.service';
import { getConfig } from '@root/config/index'; // redis和 kafka的连接配置
import { awaitWrap } from '@/utils';

const { redisSeckill, kafkaConfig } = getConfig();

// 创建kafka Client
const kafkaClient = new kafka.KafkaClient({ kafkaHost: kafkaConfig.kafkaHost });
// 创建kafka生产者
const producer = new kafka.Producer(kafkaClient, {
  // Configuration for when to consider a message as acknowledged, default 1
  requireAcks: 1,
  // The amount of time in milliseconds to wait for all acks before considered, default 100ms
  ackTimeoutMs: 100,
  // Partitioner type (default = 0, random = 1, cyclic = 2, keyed = 3, custom = 4), default 0
  partitionerType: 2,
});

@Injectable()
export class SeckillService {
  logger = new Logger('SeckillService'); // 创建nest自带的日志实例
  seckillRedisClient!: Redis.Redis; // redis连接实例
  count = 0; // 当前请求的次数

  constructor(private readonly redisClientService: RedisClientService) {
    // service 创建时异步初始化redis连接
    this.redisClientService.getSeckillRedisClient().then((client) => {
      this.seckillRedisClient = client;
    });
  }

  /*
   * ***********************
   * @desc 秒杀具体实现
   * ***********************
   */
  async secKill(params) {
    const { seckillCounterKey } = redisSeckill;
    this.logger.log(`当前请求count：${this.count++}`);

    // tips:使用乐观锁解决并发
    const [watchError] = await awaitWrap(
      this.seckillRedisClient.watch(seckillCounterKey),
    ); //监听'counter'字段更改
    watchError && this.logger.error(watchError);
    if (watchError) return watchError;

    // 获取当前当前订单剩余数量
    const [getError, reply] = await awaitWrap(
      this.seckillRedisClient.get(seckillCounterKey),
    );
    getError && this.logger.error(getError);
    if (getError) return getError;
    if (parseInt(reply) <= 0) {
      this.logger.warn('已经卖光了');
      return '已经卖光了';
    }

    //tips: 使用redis事务修改redis的counter数量减一
    const [execError, replies] = await awaitWrap(
      this.seckillRedisClient.multi().decr(seckillCounterKey).exec(),
    );
    execError && this.logger.error(execError);
    if (execError) return execError;

    // counter字段正在操作中，等待counter被其他释放
    if (!replies) {
      this.logger.warn('counter被使用');
      this.secKill(params); // 自动重试
      return;
    }

    // kafka消费数据的内容
    const payload = [
      {
        topic: kafkaConfig.topic,
        partition: 0,
        messages: [JSON.stringify(params)],
      },
    ];

    this.logger.log('生产数据payload:');
    this.logger.verbose(payload);

    // 异步等待发送kafka消费数据
    return new Promise((resolve, reject) => {
      producer.send(payload, (err, kafkaProducerResponse) => {
        if (err) {
          this.logger.error(err);
          reject(err);
          return err;
        }

        this.logger.verbose(kafkaProducerResponse);
        resolve({ payload, kafkaProducerResponse });
      });
    });
  }
}
Ts复制;
