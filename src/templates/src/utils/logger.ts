import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import os from 'os';

// Determine log level from environment
const env = process.env.NODE_ENV || 'development'; // Default to development
const level = env === 'development' ? 'debug' : 'info'; // Default to debug in development

const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }), // Format error stack traces
    winston.format.json()
);

const transports = [
    new winston.transports.Console({
        level: env === 'test' ? 'error' : level, // Only log errors in test mode
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }),
    new DailyRotateFile({
        level: 'error', // Separate file transport for errors
        filename: './logs/error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '30d' // Keep error logs for 30 days
    }),
    new DailyRotateFile({
        filename: './logs/application-%DATE%.log',
        datePattern: 'YYYY-MM-DD-HH',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d'
    })
];

// Only handle exceptions in production
const exceptionHandlers = env === 'production' ? [
    new winston.transports.File({ filename: './logs/exceptions.log' })
] : [];

const logger = winston.createLogger({
    level,
    format,
    transports,
    exceptionHandlers,
    exitOnError: false, // Do not exit on handled exceptions
    defaultMeta: { service: 'Bun', hostname: os.hostname() } // Meta information
});

export default logger;
