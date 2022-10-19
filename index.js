const amqplib = require('amqplib');
require('dotenv').config();

const queue = process.env.QUEUE;
const url = process.env.RABBIT_MQ_ULR;

(async () => {
  const conn = await amqplib.connect(url);
  const ch1 = await conn.createChannel().catch((err) => console.log("Error:1-1", err));
  await ch1.assertQueue(queue).catch((err) => console.log("Error:1-2", err));

  // Listener
  ch1.consume(queue, (msg) => {
    if (msg !== null) {
      console.log(JSON.parse(msg.content.toString()));
      console.log("--------------------------");
      ch1.ack(msg);
    } else {
      console.log('Consumer cancelled by server');
    }
  });

  // Sender
  const ch2 = await conn.createChannel().catch((err) => console.log("Error:2-1", err));;
  const payload = {
      fName: "userQuery",
      fParams:{
          id: new Date().toLocaleString(),
          email: "test@test.com"
      }
  }
  setInterval(() => {
    ch2.sendToQueue(queue, Buffer.from(JSON.stringify(payload)));
  }, 10000);
})();