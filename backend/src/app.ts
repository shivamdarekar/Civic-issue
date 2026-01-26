import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Compression middleware
app.use(compression({
  filter: (req: any, res: any) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  },
  level: 6,
  threshold: 1024
}));

app.use(limiter);

// CORS configuration
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
}));

// Middleware with optimizations
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Health check route
app.get("/", (req, res) => {
    res.json({ 
        message: "VMC Civic Issue Monitoring API", 
        status: "running",
        version: "1.0.0"
    });
});

// API Routes with performance monitoring
app.get("/api/health", async (req, res) => {
    const start = Date.now();
    try {
        // Quick database health check
        const dbStart = Date.now();
        await prisma.$queryRaw`SELECT 1`;
        const dbTime = Date.now() - dbStart;
        
        // Redis health check
        const redisStart = Date.now();
        let redisStatus = 'unavailable';
        let redisTime = 0;
        try {
            await redis.ping();
            redisStatus = 'available';
            redisTime = Date.now() - redisStart;
        } catch (error) {
            redisTime = Date.now() - redisStart;
        }
        
        const totalTime = Date.now() - start;
        
        res.json({ 
            status: "OK", 
            timestamp: new Date().toISOString(),
            database: { status: 'connected', responseTime: `${dbTime}ms` },
            redis: { status: redisStatus, responseTime: `${redisTime}ms` },
            performance: {
                healthCheckTime: `${totalTime}ms`,
                uptime: process.uptime(),
                memory: process.memoryUsage()
            }
        });
    } catch (error) {
        const totalTime = Date.now() - start;
        res.status(503).json({ 
            status: "ERROR", 
            timestamp: new Date().toISOString(),
            database: { status: 'error' },
            redis: { status: 'unavailable' },
            performance: { healthCheckTime: `${totalTime}ms` },
            error: 'Service unavailable'
        });
    }
});

// Import routes
import authRoutes from "./modules/auth/auth.routes";
import adminRoutes from "./modules/admin/admin.routes";
import issueRoutes from "./modules/issues/issue.routes";
import userRoutes from "./modules/users/user.routes";
import { prisma } from "./lib/prisma";
import { redis } from "./lib/redis";

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/issues", issueRoutes);
app.use("/api/v1/users", userRoutes);


// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;