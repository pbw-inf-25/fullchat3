const express = require('express');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// --- Chat Room State ---
const rooms = {
  general: [],
  tech: []
};

function broadcast(room, message) {
	wss.clients.forEach(client => {
	  if (client.readyState === WebSocket.OPEN && client.room === room) {
		 client.send(JSON.stringify(message));
	  }
	});
 }
 

// --- Handle WebSocket Connection ---
wss.on('connection', (ws) => {
	ws.on('message', (data) => {
	  try {
		 const msg = JSON.parse(data);
 
		 if (msg.type === 'join') {
			ws.room = msg.room;
			// Send chat history only to this client
			const history = rooms[msg.room] || [];
			ws.send(JSON.stringify({ type: 'history', messages: history }));
			return;
		 }
 
		 if (msg.type === 'message') {
			const { room, name, message } = msg;
			const chatMessage = { name, message, time: new Date().toISOString() };
			rooms[room]?.push(chatMessage);
			broadcast(room, { type: 'message', ...chatMessage });
		 }
 
	  } catch (err) {
		 console.error('Invalid message format:', err);
	  }
	});
 });
 

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
