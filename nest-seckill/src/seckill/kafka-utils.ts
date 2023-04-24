import * as kafka from 'kafka-node';
import * as Redis from 'ioredis';
import { getConfig } from '@root/config/index';
import { awaitWrap } from '@/utils';

const { kafkaConfig } = getConfig();
let kafkaConsumer!: kafka.Consumer;

// 获取kafka client
function getKafkaClient() {
  let kafkaClient!: kafka.KafkaClient;

  return () => {
    if (!kafkaClient) {
      kafkaClient = new kafka.KafkaClient({
        kafkaHost: kafkaConfig.kafkaHost,
      });
    }

    return kafkaClient;
  };
}

/**
 * @desc 获取消费者实例
 */
export function getKafkaConsumer() {
  // consumer要订阅的topics配置
  const topics = [
    {
      topic: kafkaConfig.topic,
      partition: 0,
      offset: 0,
    },
  ];

  const options = {
    //  自动提交配置   (false 不会提交偏移量，每次都从头开始读取)
    autoCommit: true,
    autoCommitIntervalMs: 5000,
    //  如果设置为true，则consumer将从有效负载中的给定偏移量中获取消息
    fromOffset: false,
  };
  const kafkaClient = getKafkaClient()();

  if (!kafkaConsumer) {
    kafkaConsumer = new kafka.Consumer(kafkaClient, topics, options);
  }

  return kafkaConsumer;
}
