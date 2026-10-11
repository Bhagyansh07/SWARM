import express, { type Express } from 'express';
import cors from 'cors';
import { createMissionRouter } from './api/missions';

/**
 * Builds the Express application. Shared by the long-running local server
 * (`src/server.ts`) and the Vercel function (`src/serverless.ts`) so both run the
 * exact same routing and orchestration code.
 */
export function createApp(): Express {
  const app = express();
  const configured = process.env.CORS_ORIGIN?.trim();
  const origin = !configured || configured === '*' ? true : configured.split(',').map((value) => value.trim());

  app.use(cors({ origin, credentials: true }));
  app.use(express.json({ limit: '1mb' }));

  app.get('/', (_req, res) => {
    res.json({ name: 'swarm-api', status: 'ok' });
  });

  app.use('/api', createMissionRouter());

  return app;
}
