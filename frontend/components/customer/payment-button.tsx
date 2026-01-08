"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import api from '@/lib/api';
import { Loader2, CreditCard } from 'lucide-react';
import Script from 'next/script';

import { Payment } from '@/types/orders';

interface PaymentButtonProps {
    amount: number;
    shopId: string;
    orderId: string;
    onSuccess: (payment: Payment) => void;
    disabled?: boolean;
}

interface RazorpaySuccessResponse {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

interface RazorpayFailureResponse {
    error: {
        description: string;
    };
}

declare global {
    interface Window {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Razorpay: any;
    }
}

export function PaymentButton({ amount, shopId, orderId, onSuccess, disabled }: PaymentButtonProps) {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handlePayment = async () => {
        setLoading(true);
        try {
            // 1. Create Order
            const { data: order } = await api.post('/payments/create-order', {
                amount,
                shopId,
                orderId
            });

            // 2. Open Razorpay
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: "Kirata Shop",
                description: `Order #${orderId.slice(-8)}`,
                order_id: order.id,
                handler: async function (response: RazorpaySuccessResponse) {
                    try {
                        // 3. Verify Payment
                        const verifyRes = await api.post('/payments/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            amount,
                            shopId,
                            orderId
                        });

                        toast({
                            title: "Payment Successful",
                            description: "Your payment has been verified.",
                        });

                        onSuccess(verifyRes.data.payment);
                    } catch (error) {
                        console.error(error);
                        toast({
                            variant: "destructive",
                            title: "Payment Verification Failed",
                            description: "Please contact support if money was deducted.",
                        });
                    }
                },
                theme: {
                    color: "#3399cc"
                }
            };

            const rzp1 = new window.Razorpay(options);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            rzp1.on('payment.failed', function (response: any) {
                const failure = response as RazorpayFailureResponse;
                toast({
                    variant: "destructive",
                    title: "Payment Failed",
                    description: failure.error.description,
                });
            });
            rzp1.open();

        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to initiate payment.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />
            <Button onClick={handlePayment} disabled={disabled || loading} className="w-full sm:w-auto">
                {loading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                    </>
                ) : (
                    <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Pay Online
                    </>
                )}
            </Button>
        </>
    );
}
