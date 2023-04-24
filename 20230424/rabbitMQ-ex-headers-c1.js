import * as amqp from 'amqplib'

const connect = await amqp.connect(`amqp://localhost:5672`);
const channel = await connect.createChannel();

await channel.assertExchange('headers-test-exchange', 'headers');

const { queue } = await channel.assertQueue('headers-queue1');
await channel.bindQueue(queue, 'headers-test-exchange', '', {
    name: 'dong'
});

channel.consume(queue, msg => {
    console.log(msg.content.toString())
}, { noAck: true });