import jwt from 'jsonwebtoken';
import { config } from '../shared/config';

interface UserPayload {
    userId: string;
    role: string;
}

export const signToken = (payload: UserPayload): string => {
    return jwt.sign(payload, config.jwtSecret, { expiresIn: '1d' });
};

export const verifyToken = (token: string): UserPayload => {
    return jwt.verify(token, config.jwtSecret) as UserPayload;
};
