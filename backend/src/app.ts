import 'reflect-metadata';
import express from 'express';
import { AppDataSource } from './config/datasource';
import conversionRoutes from './routes/conversion.routes';

export async function createApp() {
  const app = express();

  app.use(express.json());
  app.use('/api', conversionRoutes);

  // Error handling middleware
  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
  });

  await AppDataSource.initialize();

  return app;
} 