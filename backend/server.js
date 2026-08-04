// server.js

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");

// ==========================================
// Route Imports
// ==========================================

const authRoutes = require("./routes/auth.routes");
const indexRoutes = require("./routes");

// ==========================================
// Config Imports
// ==========================================

const swaggerSpec = require("./config/swagger");

// ==========================================
// Middleware Imports
// ==========================================

const errorHandler = require("./middleware/error.middleware");

const app = express();

// ==========================================
// Security Middleware
// ==========================================

app.use(helmet());

app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    })
);

app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
            success: false,
            message: "Too many requests. Please try again later.",
        },
    })
);

// ==========================================
// General Middleware
// ==========================================

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// Health Check
// ==========================================

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to DIS-SMS Backend API",
        version: process.env.API_VERSION,
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
    });
});

// ==========================================
// Swagger Documentation
// ==========================================

app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
);

// ==========================================
// API Routes
// ==========================================

app.use("/api/auth", authRoutes);

// Register all remaining routes
app.use("/api", indexRoutes);

// ==========================================
// 404 Handler
// ==========================================

app.use((req, res) => {
    return res.status(404).json({
        success: false,
        message: "Endpoint not found.",
        timestamp: new Date().toISOString(),
    });
});

// ==========================================
// Global Error Handler
// ==========================================

app.use(errorHandler);

// ==========================================
// Server Startup
// ==========================================

const PORT = Number(process.env.PORT) || 5000;

// Do not pass a listen callback: Express 5 invokes it on both
// "listening" and "error", which can falsely report a successful start.
const server = app.listen(PORT);

server.on("listening", () => {
    console.log("========================================");
    console.log("🚀 DIS-SMS Backend Started Successfully");
    console.log("========================================");
    console.log(`🌐 Server      : http://localhost:${PORT}`);
    console.log(`📚 Swagger     : http://localhost:${PORT}/api-docs`);
    console.log(`⚙️ Environment : ${process.env.NODE_ENV}`);
    console.log(`📦 API Version : ${process.env.API_VERSION}`);
    console.log("========================================");
});

server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
        console.error(
            `❌ Port ${PORT} is already in use. Stop the other process or set a different PORT.`
        );
    } else {
        console.error("❌ Failed to start server:", err.message);
    }
    process.exit(1);
});

// ==========================================
// Graceful Shutdown
// ==========================================

let isShuttingDown = false;

function shutdown(signal) {
    if (isShuttingDown) {
        return;
    }
    isShuttingDown = true;

    console.log(`\n${signal} received. Shutting down gracefully...`);

    server.close((closeErr) => {
        if (closeErr) {
            console.error("❌ Error during server shutdown:", closeErr.message);
            process.exit(1);
        }

        console.log("HTTP server closed.");
        process.exit(0);
    });

    setTimeout(() => {
        console.error("❌ Forced shutdown after timeout.");
        process.exit(1);
    }, 10000).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));