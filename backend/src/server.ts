import 'dotenv/config';
import { createApp } from './app';
import { logger } from './lib/logger';
import { resolveProvider, currentModel } from './llm/provider';

const PORT = Number(process.env.PORT ?? 8080);
const app = createApp();

app.listen(PORT, () => {
  logger.info('swarm api listening', { port: PORT, provider: resolveProvider(), model: currentModel() });
});
