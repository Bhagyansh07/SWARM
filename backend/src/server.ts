import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import { createMissionRouter } from './api/missions';
import { wireSockets } from './sockets/handlers';
import { logger } from './lib/logger';
import { resolveProvider, currentModel } from './llm/provider';

const PORT = Number(process.env.PORT ?? 8080);
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:3000';

const app = express();
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '1mb' }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: CORS_ORIGIN, credentials: true },
  transports: ['websocket', 'polling'],
});

function emit(event: string, payload: Record<string, unknown>) {
  const missionId = typeof payload.missionId === 'string' ? payload.missionId : null;
  if (missionId) io.to(`mission:${missionId}`).emit(event, payload);
}

app.use('/api', createMissionRouter(emit));

wireSockets(io, server);

server.listen(PORT, () => {
  const provider = resolveProvider();
  logger.info(`swarm backend listening on :${PORT}`, {
    provider,
    model: currentModel(),
    cors: CORS_ORIGIN,
  });
  if (provider === 'simulation') {
    logger.warn('GROQ_API_KEY missing or forced off — running in SIMULATION mode. Add a key to backend/.env for live LLM inference.');
  }
});