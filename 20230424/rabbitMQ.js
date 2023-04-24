// https://mp.weixin.qq.com/s/MOgbe4Hu4dh19H2p1Yp02w
import * as amqp from 'amqplib'

const connect = await amqp.connect(`amqp://localhost:5672`);
const channel = await connect.createChannel();

const { queue } = await channel.assertQueue('aaa');
await channel.sendToQueue('aaa', Buffer.from('hello'));
channel.consume(queue, msg => {
    console.log(msg.content.toString())
}, { noAck: true });