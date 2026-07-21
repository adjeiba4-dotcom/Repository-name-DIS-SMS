require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const hpp = require("hpp");

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const loggerMiddleware = require("./middleware/logger.middleware");
const errorHandler = require("./middleware/error.middleware");
const apiLimiter = require("./middleware/rateLimiter.middleware");

const routes = require("./routes");

const app = express();
const PORT = process.env.PORT || 5000;

/**
 * =====================================================
 * Security Middleware
 * =====================================================
 */

app.use(cors());

app.use(helmet());

app.use(hpp());

app.use(compression());

app.use(apiLimiter);

/**
 * =====================================================
 * HTTP Request Logger
 * =====================================================
 */

app.use(loggerMiddleware);

/**
 * =====================================================
 * Body Parsers
 * =====================================================
 */

app.use(
    express.json({
        limit: "10mb",
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: "10mb",
    })
);

/**
 * =====================================================
 * Health Check
 * =====================================================
 */

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "DIS-SMS Backend API is running.",
    });
});

/**
 * =====================================================
 * Swagger API Documentation
 * =====================================================
 */

app.use(
    "/api/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
        explorer: true,
        customSiteTitle: "DIS-SMS API Documentation",
    })
);

/**
 * =====================================================
 * API Routes
 * =====================================================
 */

app.use("/api", routes);

/**
 * =====================================================
 * Global Error Handler
 * (Must always be the LAST middleware)
 * =====================================================
 */

app.use(errorHandler);

/**
 * =====================================================
 * Start Server
 * =====================================================
 */

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});