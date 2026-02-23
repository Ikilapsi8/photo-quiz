import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { ClientToServerEvents, ServerToClientEvents } from "./types";
import { registerHandlers } from "./socketHandlers";

const PORT = parseInt(process.env.PORT || "3001", 10);

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

const httpServer = createServer(app);

const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const prisma = new PrismaClient();

registerHandlers(io, prisma);

httpServer.listen(PORT, () => {
  console.log(`Photo Quiz backend running on http://localhost:${PORT}`);
});

export { app, httpServer, io, prisma };
