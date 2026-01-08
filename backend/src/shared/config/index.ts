import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
    PORT: z.coerce.number().default(3000),
    DATABASE_URL: z.string().url(),
    JWT_SECRET: z.string().min(1),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    WEBHOOK_VERIFY_TOKEN: z.string().default('my_verify_token'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    console.error('❌ Invalid environment variables:', JSON.stringify(parsedEnv.error.format(), null, 4));
    process.exit(1);
}

export const config = {
    port: parsedEnv.data.PORT,
    databaseUrl: parsedEnv.data.DATABASE_URL,
    jwtSecret: parsedEnv.data.JWT_SECRET,
    environment: parsedEnv.data.NODE_ENV,
    webhookVerifyToken: parsedEnv.data.WEBHOOK_VERIFY_TOKEN,
};

