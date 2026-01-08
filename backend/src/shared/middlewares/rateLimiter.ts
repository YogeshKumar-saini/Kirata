
import rateLimit from 'express-rate-limit';

export const otpLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 3, // Limit each IP to 3 OTP requests per minute
    message: { message: "Too many OTP requests from this IP, please try again after a minute" },
    standardHeaders: true,
    legacyHeaders: false,
});

export const loginLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 login attempts per hour
    message: { message: "Too many login attempts from this IP, please try again after an hour" },
    standardHeaders: true,
    legacyHeaders: false,
});
