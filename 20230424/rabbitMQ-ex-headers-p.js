import * as amqp from 'amqplib'

const connect = await amqp.connect(`amqp://localhost:5672`);
const channel = await connect.createChannel();

await channel.assertExchange('headers-test-exchange', 'headers');

channel.publish('headers-test-exchange', '', Buffer.from('hello1'), {
    headers: {
        name: 'guang'
    }
});
channel.publish('headers-test-exchange', '', Buffer.from('hello2'), {
    headers: {
        name: 'guang'
    }
});
channel.publish('headers-test-exchange', '', Buffer.from('hello3'), {
    headers: {
        name: 'dong'
    }
});