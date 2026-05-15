import dotenv from 'dotenv';
dotenv.config();
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

import app from './src/app.js';
import connectDB from './src/common/config/db.config.js';
import { socketConnect } from './src/common/config/socket.config.js';

const PORT = process.env.PORT || 5000;
const httpServer = http.createServer(app);

connectDB();

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'https://pollify-votekaro-six.vercel.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD', 'CONNECT', 'TRACE'],
    credentials: true
  }
});

// Make io accessible to routes
app.set('io', io);

socketConnect(io);

function start() {
  try {
    httpServer.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
  }
}

start();