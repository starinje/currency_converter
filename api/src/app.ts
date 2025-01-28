import 'reflect-metadata';
import express from 'express';
import { AppDataSource } from './config/datasource';
import conversionRoutes from './routes/conversion.routes';

export async function createApp() {
  const app = express();

  app.use(express.json());
  app.use('/api', conversionRoutes);

  app.get('/health', (req: express.Request, res: express.Response) => {
    res.status(200).json({
      status: 'healthy',
      message: 'Server is up and running',
      timestamp: new Date().toISOString()
    });
  });

  // Error handling middleware
  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled error:', err);

    const response = {
      error: 'Internal server error',
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    };

    res.status(500).json(response);
  });

  await AppDataSource.initialize();

  return app;
} 


// TODO: Add healthcheck endpoint



