import { createApp } from './app';

const PORT = process.env.PORT || 3001;

async function start() {
  try {
    // Create Express app
    const app = createApp();

    // Start server
    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════════════╗
║     🚀 Inventory Dashboard API - Mock Data Mode            ║
║                                                            ║
║  Server running on:   http://localhost:${PORT}            ║
║  Health check:        http://localhost:${PORT}/health      ║
║  Dashboard API:       http://localhost:${PORT}/api/v1/...  ║
║                                                            ║
║  ✅ No database required - Using mock data                ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
      `);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server');
      process.exit(0);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
