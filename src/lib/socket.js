import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? "https://chatapp-whisper.netlify.app" // Netlify frontend URL
        : "http://localhost:5173", // Local development URL
    methods: ["GET", "POST"], // Ensure the methods are correct
    credentials: true, // Allow credentials to be sent in CORS
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// Used to store online users
const userSocketMap = {};

io.on("connection", (socket) => {
  console.log(`A user connected ${socket.id}`);

  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log(`A user disconnected ${socket.id}`);
    const userId = Object.keys(userSocketMap).find(
      (id) => userSocketMap[id] === socket.id
    );
    if (userId) {
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }
  });
});

export { io, app, server };
