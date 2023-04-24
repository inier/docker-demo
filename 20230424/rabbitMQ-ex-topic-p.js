import * as amqp from 'amqplib'

const connect = await amqp.connect(`amqp://localhost:5672`);
const channel = await connect.createChannel();

await channel.assertExchange('topic-test-exchange', 'topic');

channel.publish('topic-test-exchange', 'aaa.1', Buffer.from('hello1'));
channel.publish('topic-test-exchange', 'aaa.2', Buffer.from('hello2'));
channel.publish('topic-test-exchange', 'bbb.1', Buffer.from('hello3'));