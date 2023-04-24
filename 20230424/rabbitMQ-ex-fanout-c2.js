import * as amqp from 'amqplib'

const connect = await amqp.connect(`amqp://localhost:5672`);
const channel = await connect.createChannel();

await channel.assertExchange('fanout-test-exchange', 'fanout');

const { queue } = await channel.assertQueue('fanout-queue2');
await channel.bindQueue(queue, 'fanout-test-exchange', 'bbb');

channel.consume(queue, msg => {
    console.log(msg.content.toString())
}, { noAck: true });