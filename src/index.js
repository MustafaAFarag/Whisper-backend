import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { app, server } from "./lib/socket.js";
import { fileURLToPath } from "url";
import path from "path";

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url)); // Correct way to get __dirname in ES modules
const PORT = process.env.PORT || 5001;

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// if (process.env.NODE_ENV === "production") {
//   const clientPath = path.join(__dirname, "../client/dist");
//   app.use(express.static(clientPath));
//   app.get("*", (req, res) => {
//     res.sendFile(path.join(clientPath, "index.html"));
//   });
// }

server.listen(PORT, () => {
  console.log(`Server is Running on PORT ${PORT}`);
  connectDB();
});
