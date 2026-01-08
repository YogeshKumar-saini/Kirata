import { PrismaClient } from '@prisma/client';

export const prismaRaw = new PrismaClient();

export const prisma = prismaRaw.$extends({
    query: {

        shop: {
            async findMany({ args, query }) {
                const newArgs = args as any;
                newArgs.where = { ...args.where, deletedAt: null };
                return query(newArgs);
            },
            async findFirst({ args, query }) {
                const newArgs = args as any;
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
                return prismaRaw.shop.update({
                    where: args.where,
                    data: { deletedAt: new Date() }
                });
            },
            async deleteMany({ args, query }) {
                const newArgs = args as any;
                newArgs.data = { deletedAt: new Date() };
                return prismaRaw.shop.updateMany(newArgs);
            }
        },
        order: {
            async findMany({ args, query }) {
                const newArgs = args as any;
                newArgs.where = { ...args.where, deletedAt: null };
                return query(newArgs);
            },
            async findFirst({ args, query }) {
                const newArgs = args as any;
                newArgs.where = { ...args.where, deletedAt: null };
                return query(newArgs);
            },
            async delete({ args, query }) {
                return prismaRaw.order.update({
                    where: args.where,
                    data: { deletedAt: new Date() }
                });
            },
            async deleteMany({ args, query }) {
                const newArgs = args as any;
                newArgs.data = { deletedAt: new Date() };
                return prismaRaw.order.updateMany(newArgs);
            }
        }
    }
});
