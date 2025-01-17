// socket.js
import { Server } from "socket.io";
import http from "http";
import express from "express";
import jwt from "jsonwebtoken";
import cookie from "cookie";

const app = express();
const server = http.createServer(app);

const FRONTEND_URL =
  process.env.NODE_ENV === "production"
    ? "https://chatapp-whisper.netlify.app"
    : "http://localhost:5173";

const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST"],
  },
  cookie: true,
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Socket middleware for authentication
io.use(async (socket, next) => {
  try {
    const cookies = cookie.parse(socket.handshake.headers.cookie || "");
    const token = cookies.jwt;

    if (!token) {
      return next(new Error("Authentication required"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch (error) {
    next(new Error("Invalid token"));
  }
});

const userSocketMap = new Map();

io.on("connection", (socket) => {
  const userId = socket.userId;
  console.log(`User connected: ${userId} (Socket ID: ${socket.id})`);

  userSocketMap.set(userId, socket.id);
  io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${userId}`);
    userSocketMap.delete(userId);
    io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
  });

  // Handle errors
  socket.on("error", (error) => {
    console.error(`Socket error for user ${userId}:`, error);
  });
});

export function getReceiverSocketId(userId) {
  return userSocketMap.get(userId);
}

export { io, app, server };
