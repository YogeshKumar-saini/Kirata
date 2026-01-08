"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecentAuditLogs = exports.getUserAuditLogs = exports.createAuditLog = void 0;
const database_1 = require("../../shared/database");
const logger_1 = require("../../shared/utils/logger");
/**
 * Create an audit log entry
 */
const createAuditLog = async (userId, action, details) => {
    try {
        await database_1.prisma.auditLog.create({
            data: {
                userId,
                action,
                details: details || {}
            }
        });
    }
    catch (error) {
        // Don't throw - audit logging failure shouldn't break the app
        logger_1.logger.error('Audit log creation failed:', error);
    }
};
exports.createAuditLog = createAuditLog;
/**
 * Get audit logs for a user
 */
const getUserAuditLogs = async (userId, limit = 100) => {
    return await database_1.prisma.auditLog.findMany({
        where: {
            userId
        },
        orderBy: {
            createdAt: 'desc'
        },
        take: limit
    });
};
exports.getUserAuditLogs = getUserAuditLogs;
/**
 * Get recent audit logs
 */
const getRecentAuditLogs = async (limit = 100) => {
    return await database_1.prisma.auditLog.findMany({
        orderBy: {
            createdAt: 'desc'
        },
        take: limit
    });
};
exports.getRecentAuditLogs = getRecentAuditLogs;
