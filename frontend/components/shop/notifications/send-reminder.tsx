'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Loader2, Search, CheckCircle2, AlertCircle, Users } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface Customer {
    id: string;
    name: string | null;
    phone: string | null;
    udhaarBalance?: number; // Calculated on select if not available
}

export default function SendReminder() {
    const { toast } = useToast();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
    const [search, setSearch] = useState("");
    const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [amountMap, setAmountMap] = useState<Record<string, number>>({});

    useEffect(() => {
        fetchCustomers();
    }, []);

    useEffect(() => {
        if (!search) {
            setFilteredCustomers(customers);
        } else {
            const lower = search.toLowerCase();
            setFilteredCustomers(customers.filter(c =>
                (c.name?.toLowerCase().includes(lower) || '') ||
                (c.phone?.includes(lower) || '')
            ));
        }
    }, [search, customers]);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/shop/customers?limit=100'); // Get first 100 for now
            setCustomers(res.data.customers);
            setFilteredCustomers(res.data.customers);

            // Pre-calculate balances if possible, or fetch individually?
            // Ideally backend list returns balance, or we fetch on demand.
            // For now, let's assume we need to handle amount input manually for single, 
            // or use bulk endpoint which calculates automatically.
        } catch (error) {
            console.error("Failed to fetch customers:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedCustomers(filteredCustomers.map(c => c.id));
        } else {
            setSelectedCustomers([]);
        }
    };

    const handleCustomerToggle = (customerId: string, checked: boolean) => {
        if (checked) {
            setSelectedCustomers(prev => [...prev, customerId]);
        } else {
            setSelectedCustomers(prev => prev.filter(id => id !== customerId));
        }
    };

    const handleSend = async () => {
        if (selectedCustomers.length === 0) return;

        setSending(true);
        try {
            if (selectedCustomers.length === 1) {
                // Special flow for single customer - ask for amount if needed?
                // But simplified: Bulk endpoint handles everything based on logic
                // Or manual endpoint requires amount.
                // Let's use bulk endpoint for all to keep it simple, as it auto-calculates balance.
                const res = await api.post('/notifications/remind/payment/bulk', {
                    customerIds: selectedCustomers
                });

                toast({
                    title: "Reminders Sent",
                    description: `Successfully sent: ${res.data.success}, Failed: ${res.data.failed}`,
                    variant: res.data.failed > 0 ? "destructive" : "default"
                });
            } else {
                const res = await api.post('/notifications/remind/payment/bulk', {
                    customerIds: selectedCustomers
                });

                toast({
                    title: "Bulk Reminders Sent",
                    description: `Successfully sent: ${res.data.success}, Failed: ${res.data.failed}`,
                    variant: res.data.failed > 0 ? "destructive" : "default"
                });
            }
            setSelectedCustomers([]);
        } catch (error: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const err = error as any;
            toast({
                title: "Error",
                description: err.response?.data?.message || "Failed to send reminders",
                variant: "destructive"
            });
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="grid gap-6 md:grid-cols-2">
            {/* Customer Selection */}
            <Card className="glass border-border/40 dark:border-white/5 md:col-span-2">
                <CardHeader>
                    <CardTitle>Select Customers</CardTitle>
                    <CardDescription>Choose customers to send payment reminders to.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search customers..."
                                className="pl-9 bg-black/20 border-white/10"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Button
                            onClick={handleSend}
                            disabled={selectedCustomers.length === 0 || sending}
                            className="bg-primary hover:bg-primary/90 text-white min-w-[120px]"
                        >
                            {sending ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <Users className="h-4 w-4 mr-2" />
                            )}
                            Send ({selectedCustomers.length})
                        </Button>
                    </div>

                    <div className="rounded-md border border-white/5 bg-black/10">
                        <div className="p-3 border-b border-white/5 flex items-center gap-2 bg-muted/20">
                            <Checkbox
                                id="select-all"
                                checked={filteredCustomers.length > 0 && selectedCustomers.length === filteredCustomers.length}
                                onCheckedChange={handleSelectAll}
                            />
                            <Label htmlFor="select-all" className="font-medium cursor-pointer">
                                Select All ({filteredCustomers.length})
                            </Label>
                        </div>
                        <ScrollArea className="h-[300px]">
                            {loading ? (
                                <div className="flex justify-center items-center h-full">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : filteredCustomers.length === 0 ? (
                                <div className="text-center p-8 text-muted-foreground">
                                    No customers found.
                                </div>
                            ) : (
                                <div className="divide-y divide-white/5">
                                    {filteredCustomers.map(customer => (
                                        <div
                                            key={customer.id}
                                            className={`p-3 flex items-center gap-3 hover:bg-white/5 transition-colors ${selectedCustomers.includes(customer.id) ? 'bg-primary/5' : ''}`}
                                        >
                                            <Checkbox
                                                id={`c-${customer.id}`}
                                                checked={selectedCustomers.includes(customer.id)}
                                                onCheckedChange={(checked) => handleCustomerToggle(customer.id, checked as boolean)}
                                            />
                                            <div className="flex-1 grid gap-0.5">
                                                <Label htmlFor={`c-${customer.id}`} className="font-medium cursor-pointer">
                                                    {customer.name}
                                                </Label>
                                                <div className="text-xs text-muted-foreground flex gap-2">
                                                    <span>{customer.phone || 'No phone'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
