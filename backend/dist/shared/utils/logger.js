"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const config_1 = require("../config");
const { combine, timestamp, json, printf, colorize } = winston_1.default.format;
const consoleFormat = printf(({ level, message, timestamp, ...meta }) => {
    return `${timestamp} ${level}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
});
exports.logger = winston_1.default.createLogger({
    level: config_1.config.environment === 'development' ? 'debug' : 'info',
    format: combine(timestamp(), json()),
    transports: [
        new winston_1.default.transports.Console({
            format: config_1.config.environment === 'production'
                ? combine(timestamp(), json())
                : combine(colorize(), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), consoleFormat),
        }),
    ],
});
