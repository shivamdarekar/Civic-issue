import app from "./app";
import dotenv from "dotenv";
import { connectDb, disconnectDb } from "./lib/prisma";
import { EmailService } from "./services/email/emailService";
import { connectRedis, isRedisAvailable } from "./lib/redis";

dotenv.config();

const PORT = process.env.PORT || 5000;

// Enable keep-alive for better connection reuse
process.env.UV_THREADPOOL_SIZE = '16'; // Increase thread pool for better I/O

async function startServer() {
    try {
        // Database and email are the only startup gates; Redis is optional.
        const [dbResult, emailResult] = await Promise.allSettled([
            connectDb(),
            EmailService.initialize()
        ]);

        // Database connection (required)
        if (dbResult.status === 'fulfilled') {
            console.log('✅ Database connected');
        } else {
            console.error('❌ Database connection failed:', dbResult.reason);
            process.exit(1);
        }

        // Redis connection (optional, non-blocking)
        void connectRedis().then((connected) => {
            if (connected) {
                console.log('✅ Redis connected - caching enabled');
            } else {
                console.log('⚠️  Redis unavailable - running without cache');
            }
        });

        // Email service (optional)
        if (emailResult.status === 'fulfilled') {
            console.log('✅ Email service initialized');
        } else {
            console.warn('⚠️  Email service not configured. Password reset emails will fail.');
        }

        // Start server
        const server = app.listen(PORT, () => {
            console.log(`
🚀 VMC Civic Issue Monitoring System API
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Environment: ${process.env.NODE_ENV || 'development'}
🔗 Server:      http://localhost:${PORT}
❤️  Health:      http://localhost:${PORT}/api/health
📚 API Base:    http://localhost:${PORT}/api/v1
🔴 Redis:       ${isRedisAvailable() ? 'Connected' : 'Disabled'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            `);
        });

        // Graceful shutdown handlers
        const gracefulShutdown = async (signal: string) => {
            console.log(`\n${signal} received. Starting graceful shutdown...`);
            
            server.close(async () => {
                console.log('🔌 HTTP server closed');
                
                try {
                    await disconnectDb();
                    console.log('🗄️  Database connection closed');
                    process.exit(0);
                } catch (error) {
                    console.error('Error during database disconnection:', error);
                    process.exit(1);
                }
            });

            // Force shutdown after 10 seconds
            setTimeout(() => {
                console.error('Forced shutdown after timeout');
                process.exit(1);
            }, 10000);
        };

        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    } catch (error) {
        console.error('❌ Server startup failed:', error);
        process.exit(1);
    }
}

startServer();