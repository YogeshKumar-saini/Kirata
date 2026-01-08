import { prisma } from '../../shared/database';
import { logger } from '../../shared/utils/logger';

/**
 * Create an audit log entry
 */
export const createAuditLog = async (
    userId: string | null,
    action: string,
    details?: any
) => {
    try {
        await prisma.auditLog.create({
            data: {
                userId,
                action,
                details: details || {}
            }
        });
    } catch (error) {
        // Don't throw - audit logging failure shouldn't break the app
        logger.error('Audit log creation failed:', error);
    }
};

/**
 * Get audit logs for a user
 */
export const getUserAuditLogs = async (
    userId: string,
    limit: number = 100
) => {
    return await prisma.auditLog.findMany({
        where: {
            userId
        },
        orderBy: {
            createdAt: 'desc'
        },
        take: limit
    });
};

/**
 * Get recent audit logs
 */
export const getRecentAuditLogs = async (limit: number = 100) => {
    return await prisma.auditLog.findMany({
        orderBy: {
            createdAt: 'desc'
        },
        take: limit
    });
};
