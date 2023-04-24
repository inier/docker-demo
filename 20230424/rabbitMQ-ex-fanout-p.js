import * as amqp from 'amqplib'

const connect = await amqp.connect(`amqp://localhost:5672`);
const channel = await connect.createChannel();

await channel.assertExchange('fanout-test-exchange', 'fanout');

channel.publish('fanout-test-exchange', '', Buffer.from('hello1'));
channel.publish('fanout-test-exchange', '', Buffer.from('hello2'));
channel.publish('fanout-test-exchange', '', Buffer.from('hello3'));