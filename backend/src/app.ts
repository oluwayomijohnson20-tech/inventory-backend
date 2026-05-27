import express, { Express, Request, Response } from 'express';
import { createMockDashboardRouter } from './routes/mockDashboardRoutes';

// Extend Express Request to include org/user
declare global {
  namespace Express {
    interface Request {
      orgId?: string;
      userId?: string;
    }
  }
}

export function createApp(): Express {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // CORS
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
  });

  // Health check
  app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', message: 'Server is running with mock data' });
  });

  // Routes
  app.use('/api/v1', createMockDashboardRouter());

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      error: 'Not found',
    });
  });

  // Error handler
  app.use(
    (
      err: any,
      req: Request,
      res: Response,
      next: Function
    ) => {
      console.error('Error:', err);
      res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
      });
    }
  );

  return app;
}
