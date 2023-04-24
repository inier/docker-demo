import * as amqp from 'amqplib'

const connect = await amqp.connect(`amqp://localhost:5672`);
const channel = await connect.createChannel();

await channel.assertExchange('fanout-test-exchange', 'fanout');

const { queue } = await channel.assertQueue('fanout-queue1');
await channel.bindQueue(queue, 'fanout-test-exchange', 'aaa');

channel.consume(queue, msg => {
    console.log(msg.content.toString())
}, { noAck: true });