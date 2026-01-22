import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";


const app = express();


// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check route
app.get("/", (req, res) => {
    res.json({ 
        message: "VMC Civic Issue Monitoring API", 
        status: "running",
        version: "1.0.0"
    });
});

// API Routes
app.get("/api/health", (req, res) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Import routes
import authRoutes from "./modules/auth/auth.routes";
import adminRoutes from "./modules/admin/admin.routes";
import issueRoutes from "./modules/issues/issue.routes";
import userRoutes from "./modules/users/user.routes";

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/issues", issueRoutes);
app.use("/api/v1/users", userRoutes);


// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;