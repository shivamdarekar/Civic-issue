import app from "./app";
import dotenv from "dotenv";
import { connectDb, disconnectDb } from "./lib/prisma";
import { EmailService } from "./services/email/emailService";

dotenv.config();

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        // Connect to database
        await connectDb();
        console.log('✅ Database connected');

        // Initialize email service (optional, won't block startup)
        try {
            await EmailService.initialize();
        } catch (error) {
            console.warn('⚠️  Email service not configured. Password reset emails will fail.');
        }

        // Start server
        const server = app.listen(PORT, () => {
            console.log(`
🚀 VMC Civic Issue Monitoring System API
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Environment: ${process.env.NODE_ENV || 'development'}
🔗 Server:      http://localhost:${PORT}
❤️  Health:      http://localhost:${PORT}/health
📚 API Base:    http://localhost:${PORT}/api/v1
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