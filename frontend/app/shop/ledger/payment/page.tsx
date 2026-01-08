'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2, CheckCircle, Search, CreditCard, Banknote } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PageHeader } from '@/components/ui/PageHeader';

interface Customer {
    id: string;
    name: string | null;
    phone: string;
    balance: number;
    transactionCount: number;
}

export default function RecordPaymentPage() {
    const router = useRouter();
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [amount, setAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [udhaarCustomers, setUdhaarCustomers] = useState<Customer[]>([]);
    const [loadingCustomers, setLoadingCustomers] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUdhaarCustomers();
    }, []);

    const fetchUdhaarCustomers = async () => {
        try {
            setLoadingCustomers(true);
            const response = await api.get('/shops/customers/quick-select');
            setUdhaarCustomers(response.data.udhaarCustomers || []);
        } catch (error) {
            console.error('Failed to fetch customers:', error);
        } finally {
            setLoadingCustomers(false);
        }
    };

    const handleRecordPayment = async () => {
        if (!selectedCustomer) return;
        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) return;

        try {
            setLoading(true);
            await api.post('/ledger/payment', {
                customerId: selectedCustomer.id,
                amount: amountNum,
                paymentMethod,
                notes: notes || undefined
            });
            router.push(`/shop/ledger/customer/${selectedCustomer.id}`);
        } catch (error) {
            console.error('Failed to record payment:', error);
            alert('Failed to record payment');
        } finally {
            setLoading(false);
        }
    };

    const filteredCustomers = udhaarCustomers.filter(c =>
    (c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm))
    );

    return (
        <div className="flex flex-col gap-6 max-w-xl mx-auto pb-20 px-4 sm:px-6">
            <PageHeader
                title="Record Payment"
                description="Settle customer balance."
                showBackButton={true}
                breadcrumbs={[
                    { label: "Dashboard", href: "/shop" },
                    { label: "Ledger", href: "/shop/ledger" },
                    { label: "Payment" }
                ]}
            />

            <AnimatePresence mode="wait">
                {!selectedCustomer ? (
                    <motion.div
                        key="select-customer"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                    >
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search customer by name or phone..."
                                className="pl-9 bg-white/5 border-white/10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <ScrollArea className="h-[60vh] rounded-2xl border border-white/5 bg-white/5 p-4">
                            {loadingCustomers ? (
                                <div className="flex flex-col items-center justify-center h-40">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : filteredCustomers.length === 0 ? (
                                <div className="text-center py-20 text-muted-foreground">
                                    No customers with pending Udhaar found.
                                </div>
                            ) : (
                                <div className="grid gap-3">
                                    {filteredCustomers.map(customer => (
                                        <motion.div
                                            key={customer.id}
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.99 }}
                                            onClick={() => setSelectedCustomer(customer)}
                                            className="cursor-pointer glass border-white/5 hover:bg-white/10 p-4 rounded-xl flex items-center justify-between group transition-all"
                                        >
                                            <div className="flex items-center gap-4">
                                                <Avatar className="h-10 w-10 border border-white/10 bg-white/5">
                                                    <AvatarFallback className="text-primary font-bold">
                                                        {customer.name?.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-semibold group-hover:text-primary transition-colors">{customer.name || 'Unknown'}</p>
                                                    <p className="text-xs text-muted-foreground">{customer.phone}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Balance</p>
                                                <p className="text-lg font-bold text-red-400">₹{customer.balance.toFixed(2)}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </motion.div>
                ) : (
                    <motion.div
                        key="enter-amount"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <Card className="glass border-white/10 bg-gradient-to-br from-card/50 to-transparent overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-12 w-12 border border-white/10">
                                            <AvatarFallback className="bg-primary/20 text-primary text-lg font-bold">
                                                {selectedCustomer.name?.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <CardTitle className="text-lg">{selectedCustomer.name}</CardTitle>
                                            <CardDescription>{selectedCustomer.phone}</CardDescription>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => setSelectedCustomer(null)}>Change</Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex justify-between items-center">
                                    <span className="text-sm font-medium text-red-400">Current Outstanding</span>
                                    <span className="text-2xl font-bold text-red-500">₹{selectedCustomer.balance.toFixed(2)}</span>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-muted-foreground">Amount Received</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-2xl font-bold text-muted-foreground">₹</span>
                                            <Input
                                                type="number"
                                                className="pl-8 h-16 text-3xl font-bold bg-white/5 border-white/10 focus:border-primary/50 transition-all font-mono"
                                                placeholder="0"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                autoFocus
                                            />
                                        </div>
                                    </div>

                                    {/* Quick Amounts */}
                                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                                        <Badge
                                            variant="outline"
                                            className="cursor-pointer hover:bg-primary/20 hover:border-primary/30 py-1.5 px-3 transition-colors"
                                            onClick={() => setAmount(selectedCustomer.balance.toString())}
                                        >
                                            Full Amount
                                        </Badge>
                                        {[100, 500, 1000, 2000].map(amt => (
                                            amt <= selectedCustomer.balance && (
                                                <Badge
                                                    key={amt}
                                                    variant="outline"
                                                    className="cursor-pointer hover:bg-white/10 py-1.5 px-3 transition-colors"
                                                    onClick={() => setAmount(amt.toString())}
                                                >
                                                    ₹{amt}
                                                </Badge>
                                            )
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <div
                                            onClick={() => setPaymentMethod('CASH')}
                                            className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${paymentMethod === 'CASH' ? 'bg-primary/10 border-primary text-primary' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                                        >
                                            <Banknote className="h-6 w-6" />
                                            <span className="font-semibold">Cash</span>
                                        </div>
                                        <div
                                            onClick={() => setPaymentMethod('UPI')}
                                            className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${paymentMethod === 'UPI' ? 'bg-primary/10 border-primary text-primary' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                                        >
                                            <CreditCard className="h-6 w-6" />
                                            <span className="font-semibold">UPI / Online</span>
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <Label className="text-muted-foreground mb-1.5 block">Notes (Optional)</Label>
                                        <Textarea
                                            placeholder="Add a note..."
                                            className="bg-white/5 border-white/10 resize-none"
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/25"
                                    size="lg"
                                    onClick={handleRecordPayment}
                                    disabled={loading || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > selectedCustomer.balance}
                                >
                                    {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle className="mr-2 h-5 w-5" />}
                                    Confirm Payment
                                </Button>
                            </CardFooter>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
