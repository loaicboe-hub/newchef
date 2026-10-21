import { createApp } from './app';
import { env } from './config/env';
import prisma from './config/prisma';

const app = createApp();

async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL database successfully.');

    app.listen(env.PORT, '0.0.0.0', () => {
      console.log(`🚀 Chef Fergany Backend Server running on http://0.0.0.0:${env.PORT}`);
      console.log(`🌐 Environment: ${env.NODE_ENV}`);
      console.log(`📁 Uploads served from: ${env.UPLOAD_PATH}`);
      console.log(`🔗 Allowed Frontend: ${env.FRONTEND_URL}`);
    });
  } catch (err) {
    console.error('❌ Failed to connect to database or start server:', err);
    // Don't crash immediately in dev so app can be inspected
    if (env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      app.listen(env.PORT, '0.0.0.0', () => {
        console.log(`⚠️ Server running on port ${env.PORT} (Warning: Database not connected yet).`);
      });
    }
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('🔌 Disconnected from PostgreSQL. Shutting down gracefully.');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  console.log('🔌 Disconnected from PostgreSQL. Shutting down gracefully.');
  process.exit(0);
});

startServer();
