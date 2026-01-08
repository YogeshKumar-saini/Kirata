"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = exports.prismaRaw = void 0;
const client_1 = require("@prisma/client");
exports.prismaRaw = new client_1.PrismaClient();
exports.prisma = exports.prismaRaw.$extends({
    query: {
        shop: {
            async findMany({ args, query }) {
                const newArgs = args;
                newArgs.where = { ...args.where, deletedAt: null };
                return query(newArgs);
            },
            async findFirst({ args, query }) {
                const newArgs = args;
                newArgs.where = { ...args.where, deletedAt: null };
                return query(newArgs);
            },
            async findUnique({ args, query }) {
                // findUnique intentionally left without soft delete filter 
                // because it requires unique constraints on deletedAt to be strictly correct 
                // or we accept it returns deleted records if accessed by ID directly.
                return query(args);
            },
            async delete({ args, query }) {
                return exports.prismaRaw.shop.update({
                    where: args.where,
                    data: { deletedAt: new Date() }
                });
            },
            async deleteMany({ args, query }) {
                const newArgs = args;
                newArgs.data = { deletedAt: new Date() };
                return exports.prismaRaw.shop.updateMany(newArgs);
            }
        },
        order: {
            async findMany({ args, query }) {
                const newArgs = args;
                newArgs.where = { ...args.where, deletedAt: null };
                return query(newArgs);
            },
            async findFirst({ args, query }) {
                const newArgs = args;
                newArgs.where = { ...args.where, deletedAt: null };
                return query(newArgs);
            },
            async delete({ args, query }) {
                return exports.prismaRaw.order.update({
                    where: args.where,
                    data: { deletedAt: new Date() }
                });
            },
            async deleteMany({ args, query }) {
                const newArgs = args;
                newArgs.data = { deletedAt: new Date() };
                return exports.prismaRaw.order.updateMany(newArgs);
            }
        }
    }
});
