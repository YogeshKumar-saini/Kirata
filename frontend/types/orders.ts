export type OrderStatus = 'PENDING' | 'ACCEPTED' | 'READY' | 'COLLECTED' | 'CANCELLED';

export interface OrderItem {
    id?: string;
    name: string;
    quantity: number;
    price: number;
    total: number;
}

export interface Shop {
    id: string;
    name: string;
    phone: string;
    address?: string;
    city: string;
    category?: string;
}

export interface Order {
    orderId: string;
    shopId: string;
    customerId: string;
    status: OrderStatus;
    totalAmount: number;
    discount: number;
    items: OrderItem[] | { [key: string]: OrderItem }; // Handling the case where items might be an object
    createdAt: string;
    updatedAt: string;
    shop?: Shop;
    notes?: string;
    paymentPreference?: 'CASH' | 'UPI' | 'UDHAAR';
    fulfillmentMethod?: 'PICKUP' | 'DELIVERY';
    deliveryCharge?: number;
    payments?: Payment[];
    priceVerified?: boolean;
}

export interface Payment {
    id: string;
    gatewayPaymentId?: string;
    amount: number;
    status: 'PENDING' | 'SUCCESS' | 'FAILED';
    method: string;
    createdAt: string;
}
