import winston from 'winston';
import { config } from '../config';

const { combine, timestamp, json, printf, colorize } = winston.format;

const consoleFormat = printf(({ level, message, timestamp, ...meta }) => {
    return `${timestamp} ${level}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
});

export const logger = winston.createLogger({
    level: config.environment === 'development' ? 'debug' : 'info',
    format: combine(timestamp(), json()),
    transports: [
        new winston.transports.Console({
            format: config.environment === 'production'
                ? combine(timestamp(), json())
                : combine(
                    colorize(),
                    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                    consoleFormat
                ),
        }),
    ],
});
