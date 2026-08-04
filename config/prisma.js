// config/prisma.js

const { PrismaClient } = require("@prisma/client");

/**
 * Configure log levels dynamically based on environment.
 * Development: Log queries, warnings, and errors.
 * Production: Log errors and warnings only to avoid log file bloat and protect sensitive data.
 */
const logLevels =
    process.env.NODE_ENV === "production" ?
    ["warn", "error"] :
    ["query", "info", "warn", "error"];

// Prevent multiple instances of Prisma Client in Node process (prevents pool exhaustion in dev)
const globalForPrisma = global;

const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: logLevels,
    });

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}

/**
 * Graceful Shutdown Handler
 * Ensures database connection pools are closed properly when process terminates.
 */
const handleShutdown = async(signal) => {
    console.log(`[Database] Received ${signal}. Closing Prisma Client connection...`);
    await prisma.$disconnect();
    console.log("[Database] Prisma Client disconnected gracefully.");
    process.exit(0);
};

process.on("SIGINT", () => handleShutdown("SIGINT"));
process.on("SIGTERM", () => handleShutdown("SIGTERM"));

module.exports = prisma;