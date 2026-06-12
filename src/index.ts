import dotenv from 'dotenv';
import { connectDB } from './config/db';
import app from './app';
import socketServer from './socket';

dotenv.config();

connectDB();

const PORT = process.env.PORT || 5000;
const SOCKET_PORT = process.env.SOCKET_PORT || 5001;

app.listen(PORT, () => {
  console.log(`REST API Server running on port ${PORT}`);
});

socketServer.listen(SOCKET_PORT, () => {
  console.log(`Socket.IO Server running on port ${SOCKET_PORT}`);
});
