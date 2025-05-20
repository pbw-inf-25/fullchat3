const express = require('express');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Connect to MongoDB
mongoose.connect('mongodb://root:root@pbw-networks:27017/chatdb?authSource=admin', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB connected')).catch(console.error);

// ✅ Define Message Schema
const messageSchema = new mongoose.Schema({
  room: String,
  name: String,
  message: String,
  time: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

// --- Chat Room State ---
const rooms = {
  general: [],
  tech: []
};

// ✅ Load Messages on Startup
async function preloadMessages() {
  const messages = await Message.find().lean();
  for (const msg of messages) {
    if (!rooms[msg.room]) rooms[msg.room] = [];
    rooms[msg.room].push({
      name: msg.name,
      message: msg.message,
      time: msg.time
    });
  }
  console.log('✅ Messages loaded from DB');
}
preloadMessages();

// Broadcast to room
function broadcast(room, message) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN && client.room === room) {
      client.send(JSON.stringify(message));
    }
  });
}

// --- Handle WebSocket Connection ---
wss.on('connection', (ws) => {
  ws.on('message', async (data) => {
    try {
      const msg = JSON.parse(data);

      if (msg.type === 'join') {
        ws.room = msg.room;
        const history = rooms[msg.room] || [];
        ws.send(JSON.stringify({ type: 'history', messages: history }));
        return;
      }

      if (msg.type === 'message') {
        const { room, name, message } = msg;
        const chatMessage = { name, message, time: new Date().toISOString() };

        // ✅ Save to memory and DB
        rooms[room]?.push(chatMessage);
        await Message.create({ room, name, message });

        broadcast(room, { type: 'message', ...chatMessage });
      }

    } catch (err) {
      console.error('Invalid message format:', err);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
