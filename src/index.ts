import express from 'express';
import amqp from 'amqplib';

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// RabbitMQ connection setup
const rabbitUrl = 'amqp://localhost'; // Adjust if needed
let channel: any;

async function connectToRabbitMQ() {
  try {
    const connection = await amqp.connect(rabbitUrl);
    channel = await connection.createChannel();
    await channel.assertQueue('messages'); // Create a queue named 'messages'
    console.log('Connected to RabbitMQ');
  } catch (error) {
    console.error('Error connecting to RabbitMQ:', error);
  }
}

app.post('/messages', async (req, res) => {
  const message = req.body.message; // Expecting { "message": "your message" }
  if (!message) {
    return res.status(400).send('Message is required');
  }

  try {
    // Send message to RabbitMQ
    await channel.sendToQueue('messages', Buffer.from(message));
    console.log(`Message sent to RabbitMQ: ${message}`);
    res.status(200).send('Message sent to RabbitMQ');
  } catch (error) {
    console.error('Error sending message to RabbitMQ:', error);
    res.status(500).send('Error sending message');
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

connectToRabbitMQ();
