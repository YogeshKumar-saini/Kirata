import { prisma } from '../../shared/database';
import { logger } from '../../shared/utils/logger';
import { OrderStatus } from '@prisma/client';
import { ApiError } from '../../shared/errors/ApiError';
import { Decimal } from '@prisma/client/runtime/library';

// Structured Order Item
interface OrderItemInput {
    productId?: string; // Optional if ad-hoc item
    name: string;
    quantity: number;
    price?: number; // Optional if productId provided
}

export const createOrder = async (
    shopId: string,
    customerId: string,
    items: OrderItemInput[],
    offerCode?: string,
    paymentPreference?: 'CASH' | 'UPI' | 'UDHAAR',
    fulfillmentMethod?: 'PICKUP' | 'DELIVERY'
) => {
    // ... existing validation ...
    const shop = await prisma.shop.findUnique({ where: { shopId } });
    if (!shop) throw new ApiError(404, 'Shop not found');

    const OfferService = await import('../offers/service');

    return prisma.$transaction(async (tx) => {
        let subTotal = 0;

        // 1. Optimization: Fetch all needed products in one query
        const productIds = items.filter(i => i.productId).map(i => i.productId!);
        const productsMap = new Map();

        if (productIds.length > 0) {
            const products = await tx.product.findMany({
                where: { productId: { in: productIds }, shopId }
            });
            products.forEach(p => productsMap.set(p.productId, p));
        }

        // Process items
        const processedItems = await Promise.all(items.map(async (item) => {
            let itemTotal = 0;
            if (item.productId) {
                const product = productsMap.get(item.productId);

                if (!product) {
                    throw new ApiError(400, `Product not found or invalid: ${item.name}`);
                }

                if (product.stock < item.quantity) {
                    throw new ApiError(400, `Insufficient stock for product: ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`);
                }

                // Update stock
                await tx.product.update({
                    where: { productId: item.productId },
                    data: { stock: { decrement: item.quantity } }
                });

                itemTotal = Number(product.price) * item.quantity;
                subTotal += itemTotal;

                return {
                    productId: product.productId,
                    name: product.name,
                    price: Number(product.price),
                    costPrice: Number(product.costPrice || 0),
                    quantity: item.quantity,
                    total: itemTotal
                };
            }

            // Ad-hoc
            if (!item.name) throw new ApiError(400, 'Items must have a name');
            const price = item.price !== undefined ? item.price : 0;
            itemTotal = price * item.quantity;
            subTotal += itemTotal;

            return {
                name: item.name,
                price: price,
                costPrice: 0,
                quantity: item.quantity,
                total: itemTotal
            };
        }));

        // Handle Offer
        let discount = 0;
        let offerId = null;

        if (offerCode) {
            const redemptionResult = await OfferService.redeemOffer(shopId, offerCode, subTotal, tx);
            discount = Number(redemptionResult.discountAmount);
            offerId = redemptionResult.offerId;
        }

        // Calculate Delivery Charge
        let deliveryCharge = 0;
        const isStoreOrder = processedItems.some(i => i.price > 0);
        if (fulfillmentMethod === 'DELIVERY' && isStoreOrder) {
            deliveryCharge = 39;
        }

        const totalAmount = subTotal - discount + deliveryCharge;

        // Create Order
        const order = await tx.order.create({
            data: {
                shopId,
                customerId,
                items: processedItems,
                status: 'PENDING',
                totalAmount: totalAmount,
                discount: discount,
                deliveryCharge: deliveryCharge,
                offerId: offerId,
                paymentPreference: paymentPreference,
                fulfillmentMethod: fulfillmentMethod,
                pickupEtaMinutes: fulfillmentMethod === 'PICKUP' ? 30 : null, // Default 30 mins for pickup
            },
        });

        return order;
    });
};

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
    const order = await prisma.order.findUnique({
        where: { orderId },
        include: { shop: true, customer: true }
    });
    if (!order) throw new ApiError(404, 'Order not found');

    // Check price verification for manual orders when accepting
    if (status === 'ACCEPTED' && !(order as any).priceVerified) {
        // Check if this is a manual order (has items without productId)
        const items = order.items as any[];
        const hasManualItems = items.some(item => !item.productId);

        if (hasManualItems) {
            throw new ApiError(400, 'Cannot accept order. Please verify prices first.');
        }
    }

    const updated = await prisma.order.update({
        where: { orderId },
        data: { status },
    });

    // If order is collected, record it as a sale in the ledger
    if (status === 'COLLECTED' && order.status !== 'COLLECTED') {
        const LedgerService = await import('../ledger/service');
        try {
            // Use order's payment preference or default to UDHAAR if not set (or if preference is CASH but not confirmed paid?)
            // For safety, if preference is UDHAAR, record as UDHAAR. If CASH/UPI, record accordingly.
            const paymentType = order.paymentPreference || 'UDHAAR';

            // Calculate profit
            const items = order.items as any[];
            const totalCost = items.reduce((sum, item) => sum + (Number(item.costPrice || 0) * item.quantity), 0);
            const profit = Number(order.totalAmount) - totalCost;

            await LedgerService.recordSale(
                order.shopId,
                Number(order.totalAmount),
                paymentType,
                'ORDER',
                order.customerId,
                `Order #${order.orderId.slice(0, 8)}`,
                true, // Bypass credit limit check on order fulfillment
                profit
            );
        } catch (err) {
            logger.error(`Failed to record sale for collected order ${orderId}:`, err);
        }
    }

    return updated;
}

/**
 * Verify order prices
 */
export async function verifyOrderPrice(orderId: string, verifiedBy: string) {
    const order = await prisma.order.findUnique({ where: { orderId } });

    if (!order) {
        throw new ApiError(404, 'Order not found');
    }

    // Check if order has valid prices
    const items = order.items as any[];
    const hasInvalidPrices = items.some(item => !item.price || item.price <= 0);

    if (hasInvalidPrices) {
        throw new ApiError(400, 'Cannot verify order with zero or missing prices. Please update prices first.');
    }

    return prisma.order.update({
        where: { orderId },
        data: {
            priceVerified: true,
            verifiedAt: new Date(),
            verifiedBy
        }
    });
}

export const getOrdersByCustomer = async (customerId: string) => {
    return prisma.order.findMany({ where: { customerId }, orderBy: { createdAt: 'desc' } });
};

export const getOrdersByShop = async (shopId: string) => {
    return prisma.order.findMany({ where: { shopId }, orderBy: { createdAt: 'desc' } });
};

// Get order by ID with full details
export async function getOrderById(orderId: string) {
    return prisma.order.findUnique({
        where: { orderId },
        include: {
            shop: {
                select: {
                    shopId: true,
                    name: true,
                    phone: true,
                    city: true
                }
            },
            customer: {
                select: {
                    id: true,
                    name: true,
                    phone: true,
                    address: true
                }
            },
            payments: {
                orderBy: { createdAt: 'desc' }
            }
        }
    });
}

export const updateOrderItems = async (orderId: string, items: any[], newStatus?: string) => {
    // We need to fetch current order to maintain discount and delivery charge
    const currentOrder = await prisma.order.findUnique({ where: { orderId } });
    if (!currentOrder) throw new Error("Order not found");

    let subTotal = 0;
    const processedItems = items.map(item => {
        const itemTotal = Number(item.price) * (item.quantity || 1);
        subTotal += itemTotal;
        return {
            name: item.name,
            price: Number(item.price),
            quantity: item.quantity,
            total: itemTotal
        };
    });

    // Discount and delivery charge are maintained from original order
    const totalAmount = subTotal - Number(currentOrder.discount) || 0 + Number(currentOrder.deliveryCharge || 0);

    const updateData: any = {
        items: processedItems,
        totalAmount: totalAmount,
        // Reset price verification since items changed
        priceVerified: false,
        verifiedAt: null,
        verifiedBy: null
    };

    if (newStatus) {
        // Prevent setting status to ACCEPTED directly via this endpoint if it's a manual order update
        // The proper flow is update items -> verify -> accept
        if (newStatus === 'ACCEPTED') {
            throw new ApiError(400, 'Cannot accept order directly when updating items. Please update items, then verify prices separately.');
        }
        updateData.status = newStatus;
    }

    return prisma.order.update({
        where: { orderId },
        data: updateData,
        include: {
            shop: true,
            customer: true
        }
    });
};
