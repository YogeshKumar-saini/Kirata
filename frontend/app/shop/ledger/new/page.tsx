'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Search, Plus, User, X, CheckCircle2, AlertCircle, ShoppingCart } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, Suspense } from "react";
import api from "@/lib/api";
import { CreditLimitWarning } from "@/components/ledger/credit-limit-warning";
import { motion, AnimatePresence } from "framer-motion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PageHeader } from "@/components/ui/PageHeader";

interface Customer {
    id: string;
    phone: string;
    name: string;
    uniqueId: string;
    balance?: number;
    transactionCount?: number;
}

export default function NewSalePage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh] text-muted-foreground">Loading...</div>}>
            <NewSalePageContent />
        </Suspense>
    );
}

function NewSalePageContent() {
    const searchParams = useSearchParams();

    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [amount, setAmount] = useState('');
    const [notes, setNotes] = useState('');

    // Customer selection state
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [searchResults, setSearchResults] = useState<Customer[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);

    // New customer form
    const [newCustomerPhone, setNewCustomerPhone] = useState('');
    const [newCustomerName, setNewCustomerName] = useState('');

    // Quick select customers
    const [udhaarCustomers, setUdhaarCustomers] = useState<Customer[]>([]);
    const [recentCustomers, setRecentCustomers] = useState<Customer[]>([]);
    const [loadingQuickSelect, setLoadingQuickSelect] = useState(true);

    const [formStatus, setFormStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });

    const searchRef = useRef<HTMLDivElement>(null);

    // Fetch quick-select customers on mount
    useEffect(() => {
        fetchQuickSelectCustomers();
    }, []);

    const fetchQuickSelectCustomers = async () => {
        try {
            setLoadingQuickSelect(true);
            const response = await api.get('/shops/customers/quick-select');
            setUdhaarCustomers(response.data.udhaarCustomers || []);
            setRecentCustomers(response.data.recentCustomers || []);
        } catch (error) {
            console.error('Failed to fetch quick-select customers:', error);
        } finally {
            setLoadingQuickSelect(false);
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Pre-fill from URL parameters
    useEffect(() => {
        const customerId = searchParams.get('customerId');
        const paymentType = searchParams.get('paymentType');

        if (paymentType === 'UDHAAR') {
            setPaymentMethod('UDHAAR');
        }

        if (customerId) {
            // Fetch customer details
            api.get(`/shops/customers/${customerId}`)
                .then(response => {
                    setSelectedCustomer(response.data);
                })
                .catch(error => {
                    console.error('Failed to fetch customer:', error);
                });
        }
    }, [searchParams]);

    // Search customers as user types
    useEffect(() => {
        const searchCustomers = async () => {
            if (searchQuery.length < 2) {
                setSearchResults([]);
                setShowDropdown(false);
                return;
            }

            setIsSearching(true);
            setShowDropdown(true);

            try {
                const response = await api.get(`/shops/customers/search?q=${encodeURIComponent(searchQuery)}`);
                setSearchResults(response.data.customers || []);
            } catch (error) {
                console.error('Search failed:', error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        };

        const debounce = setTimeout(searchCustomers, 300);
        return () => clearTimeout(debounce);
    }, [searchQuery]);

    const handleSelectCustomer = (customer: Customer) => {
        setSelectedCustomer(customer);
        setSearchQuery('');
        setShowDropdown(false);
        setSearchResults([]);
    };

    const handleCreateNewCustomer = async () => {
        if (!newCustomerPhone.trim()) {
            setFormStatus({ type: 'error', message: 'Phone number is required' });
            return;
        }

        try {
            const response = await api.post('/shops/customers/lookup', {
                phone: newCustomerPhone,
                name: newCustomerName || undefined
            });

            const customer: Customer = response.data;
            setSelectedCustomer(customer);
            setShowNewCustomerForm(false);
            setNewCustomerPhone('');
            setNewCustomerName('');
            setFormStatus({ type: null, message: '' });
        } catch (error: unknown) {
            console.error('Failed to create customer:', error);
             
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            const errorMessage = err.response?.data?.message || err.message || 'Failed to create customer';
            setFormStatus({ type: 'error', message: errorMessage });
        }
    };

    interface CreditWarningData {
        currentBalance: number;
        creditLimit: number;
        projectedBalance: number;
        exceededBy: number;
        message?: string;
    }

    const [creditWarning, setCreditWarning] = useState<CreditWarningData | null>(null);

    const recordTransaction = async (bypass: boolean = false) => {
        setFormStatus({ type: null, message: '' });

        if (!amount || parseFloat(amount) <= 0) {
            setFormStatus({ type: 'error', message: 'Please enter a valid amount' });
            return;
        }

        if (paymentMethod === 'UDHAAR' && !selectedCustomer) {
            setFormStatus({ type: 'error', message: 'Please select a customer for Udhaar transactions' });
            return;
        }

        try {
            const saleData: { amount: number; paymentType: string; source: string; customerId?: string; bypassCreditLimit?: boolean; notes?: string } = {
                amount: parseFloat(amount),
                paymentType: paymentMethod,
                source: 'MANUAL',
                bypassCreditLimit: bypass,
                notes: notes
            };

            // Only include customerId if we have a selected customer
            if (selectedCustomer) {
                saleData.customerId = selectedCustomer.id;
            }

            console.log('Sending sale data:', saleData);

            // Call the backend API using the api utility (automatically includes auth token)
            await api.post('/ledger/sale', saleData);

            // Success! Show confirmation and reset form
            setFormStatus({
                type: 'success',
                message: `Sale recorded successfully! ₹${amount} via ${paymentMethod}`
            });

            // Reset form
            setAmount('');
            setNotes('');
            // setSelectedCustomer(null); // Optional: keep customer selected for rapid entry? Let's clear for now to avoid accidental double entry to same person.
            if (paymentMethod === 'UDHAAR') {
                setSelectedCustomer(null); // Definitely clear for Udhaar to force check
            }
            // For cash maybe keep it? Let's clear all for consistency.
            setSelectedCustomer(null);

            setPaymentMethod('CASH');
            setCreditWarning(null); // Clear any warning

            // Clear success message after 3 seconds
            setTimeout(() => setFormStatus({ type: null, message: '' }), 3000);

        } catch (error: unknown) {
            console.error('Failed to record sale:', error);
             
            const errorResponse = (error as { response?: { data?: { message?: string; errors?: unknown[]; error?: string } } })?.response?.data;
            console.error('Error response', errorResponse);

            // Check for Credit Limit Exceeded
            if (errorResponse?.message === 'CREDIT_LIMIT_EXCEEDED' && errorResponse.errors?.[0]) {
                setCreditWarning(errorResponse.errors[0] as CreditWarningData);
                return;
            }

            // Extract detailed error message
            let errorMessage = 'Failed to record sale. Please try again.';

            if (errorResponse) {
                const { message, errors } = errorResponse;
                if (errors && Array.isArray(errors) && errors.length > 0) {
                    // Show validation errors
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const validationErrors = errors.map((e: any) => e.message || `${e.field}: ${e.message}`).join('\n');
                    errorMessage = `Validation Error: ${validationErrors}`;
                } else if (message) {
                    errorMessage = message;
                } else if (errorResponse.error) {
                    errorMessage = errorResponse.error;
                }
            } else if ((error as { message?: string })?.message) {
                errorMessage = (error as { message?: string }).message || 'Unknown error';
            }

            setFormStatus({ type: 'error', message: errorMessage });
        }
    };

    const handleRecordSale = () => recordTransaction(false);
    const handleOverrideCreditLimit = () => recordTransaction(true);

    return (
        <div className="flex flex-col gap-6 max-w-xl mx-auto pb-10 px-4 sm:px-6">
            <PageHeader
                title="Record Sale"
                description="Quickly record a manual sale or udhaar entry."
                showBackButton={true}
                breadcrumbs={[
                    { label: "Dashboard", href: "/shop" },
                    { label: "Ledger", href: "/shop/ledger" },
                    { label: "New Sale" }
                ]}
            />

            <Card className="glass border-border/40 shadow-xl overflow-hidden relative z-10">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />
                <CardContent className="space-y-6 pt-6">
                    {/* Customer Selection */}
                    <div className="grid w-full items-center gap-2">
                        <Label htmlFor="customer" className="text-sm font-medium">Select Customer</Label>

                        <AnimatePresence mode="wait">
                            {selectedCustomer ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="p-4 bg-primary/10 border border-primary/20 rounded-xl relative overflow-hidden group"
                                >
                                    <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                                    <div className="flex items-center justify-between relative z-10">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                                                <User className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-foreground">
                                                    {selectedCustomer.name}
                                                </p>
                                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                    {selectedCustomer.phone}
                                                    {selectedCustomer.balance !== undefined && selectedCustomer.balance > 0 && (
                                                        <span className="text-xs font-medium px-2 py-0.5 bg-destructive/10 text-destructive rounded-full">
                                                            ₹{selectedCustomer.balance} due
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setSelectedCustomer(null)}
                                            className="hover:bg-destructive/10 hover:text-destructive"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="space-y-4"
                                >
                                    <div className="relative" ref={searchRef}>
                                        <div className="relative group">
                                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                            <Input
                                                type="text"
                                                id="customer"
                                                placeholder="Search by phone or name..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                onFocus={() => searchQuery.length >= 2 && setShowDropdown(true)}
                                                className="pl-10 h-11 bg-background/50 focus:bg-background transition-all"
                                            />
                                        </div>

                                        {/* Dropdown Results */}
                                        <AnimatePresence>
                                            {showDropdown && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="absolute z-50 w-full mt-2 bg-background/95 backdrop-blur-md border border-border rounded-xl shadow-xl max-h-60 overflow-auto"
                                                >
                                                    {isSearching ? (
                                                        <div className="p-4 text-center text-sm text-muted-foreground">
                                                            Searching...
                                                        </div>
                                                    ) : searchResults.length > 0 ? (
                                                        <div className="p-2">
                                                            {searchResults.map((customer) => (
                                                                <button
                                                                    key={customer.id}
                                                                    onClick={() => handleSelectCustomer(customer)}
                                                                    className="w-full p-3 hover:bg-muted/50 text-left rounded-lg transition-colors flex items-center justify-between group"
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                                                                            {(customer.name || '?').slice(0, 2)}
                                                                        </div>
                                                                        <div>
                                                                            <p className="font-medium text-sm group-hover:text-primary transition-colors">{customer.name}</p>
                                                                            <p className="text-xs text-muted-foreground">{customer.phone}</p>
                                                                        </div>
                                                                    </div>
                                                                    {customer.balance !== undefined && customer.balance > 0 && (
                                                                        <span className="text-xs text-destructive font-medium bg-destructive/10 px-2 py-1 rounded-full">
                                                                            ₹{customer.balance} due
                                                                        </span>
                                                                    )}
                                                                </button>
                                                            ))}
                                                            <div className="h-px bg-border/50 my-2" />
                                                            <button
                                                                onClick={() => {
                                                                    setShowNewCustomerForm(true);
                                                                    setShowDropdown(false);
                                                                }}
                                                                className="w-full p-2 text-primary font-medium flex items-center justify-center gap-2 hover:bg-primary/5 rounded-lg text-sm"
                                                            >
                                                                <Plus className="h-4 w-4" />
                                                                Add new customer
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="p-4 flex flex-col items-center gap-2">
                                                            <p className="text-sm text-muted-foreground text-center">
                                                                No customers found
                                                            </p>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="w-full"
                                                                onClick={() => {
                                                                    setShowNewCustomerForm(true);
                                                                    setShowDropdown(false);
                                                                }}
                                                            >
                                                                <Plus className="h-4 w-4 mr-2" />
                                                                Add new customer
                                                            </Button>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Quick Select Customers */}
                                    {!loadingQuickSelect && (udhaarCustomers.length > 0 || recentCustomers.length > 0) && (
                                        <div className="space-y-3">
                                            {/* Udhaar Customers */}
                                            {udhaarCustomers.length > 0 && (
                                                <div>
                                                    <Label className="text-xs text-muted-foreground font-semibold flex items-center gap-1 mb-2 uppercase tracking-wider">
                                                        Recent Due
                                                    </Label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {udhaarCustomers.slice(0, 4).map(customer => (
                                                            <Button
                                                                key={customer.id}
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-auto py-1.5 px-3 border-destructive/20 hover:bg-destructive/10 hover:text-destructive flex flex-col items-start gap-0.5"
                                                                onClick={() => handleSelectCustomer(customer)}
                                                            >
                                                                <span className="font-medium text-xs">{customer.name || customer.phone}</span>
                                                                <span className="text-[10px] opacity-80">₹{customer.balance?.toFixed(0)}</span>
                                                            </Button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Recent Customers */}
                                            {recentCustomers.length > 0 && (
                                                <div>
                                                    <Label className="text-xs text-muted-foreground font-semibold flex items-center gap-1 mb-2 uppercase tracking-wider">
                                                        Recents
                                                    </Label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {recentCustomers.slice(0, 5).map(customer => (
                                                            <Button
                                                                key={customer.id}
                                                                variant="secondary"
                                                                size="sm"
                                                                onClick={() => handleSelectCustomer(customer)}
                                                                className="h-7 text-xs bg-muted/50 hover:bg-muted"
                                                            >
                                                                {customer.name || customer.phone}
                                                            </Button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* New Customer Form */}
                                    <AnimatePresence>
                                        {showNewCustomerForm && !selectedCustomer && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="p-4 border rounded-xl bg-muted/30 overflow-hidden"
                                            >
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="font-medium text-sm">Add New Customer</h4>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 w-6 p-0"
                                                        onClick={() => setShowNewCustomerForm(false)}
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="space-y-1">
                                                        <Label htmlFor="newPhone" className="text-xs">Phone Number *</Label>
                                                        <Input
                                                            type="tel"
                                                            id="newPhone"
                                                            placeholder="9876543210"
                                                            value={newCustomerPhone}
                                                            onChange={(e) => setNewCustomerPhone(e.target.value)}
                                                            className="h-9 bg-background"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label htmlFor="newName" className="text-xs">Name (Optional)</Label>
                                                        <Input
                                                            type="text"
                                                            id="newName"
                                                            placeholder="Customer name"
                                                            value={newCustomerName}
                                                            onChange={(e) => setNewCustomerName(e.target.value)}
                                                            className="h-9 bg-background"
                                                        />
                                                    </div>
                                                    <Button
                                                        className="w-full h-9"
                                                        onClick={handleCreateNewCustomer}
                                                    >
                                                        Create & Select
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="h-px bg-border/50" />

                    {/* Amount */}
                    <div className="grid w-full items-center gap-2">
                        <Label htmlFor="amount" className="text-sm font-medium">Sale Amount (₹)</Label>
                        <div className="relative group">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-foreground transition-colors" />
                            <Input
                                type="number"
                                id="amount"
                                className="pl-10 text-xl font-bold h-14 bg-background/50 border-input/50 focus:bg-background transition-all"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Payment Method</Label>
                        <div className="grid grid-cols-2 gap-3">
                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setPaymentMethod('CASH')}
                                type="button"
                                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${paymentMethod === 'CASH'
                                    ? 'border-primary bg-primary/5 text-primary'
                                    : 'border-border/50 bg-background/50 hover:bg-muted/50 text-muted-foreground'
                                    }`}
                            >
                                <span className="font-semibold">Cash / UPI</span>
                                <span className="text-xs mt-1 opacity-70">Payment Received</span>
                            </motion.button>
                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setPaymentMethod('UDHAAR')}
                                type="button"
                                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${paymentMethod === 'UDHAAR'
                                    ? 'border-destructive bg-destructive/5 text-destructive'
                                    : 'border-border/50 bg-background/50 hover:bg-muted/50 text-muted-foreground'
                                    }`}
                            >
                                <span className="font-semibold">Udhaar</span>
                                <span className="text-xs mt-1 opacity-70">Credit (Due)</span>
                            </motion.button>
                        </div>
                        <AnimatePresence>
                            {paymentMethod === 'UDHAAR' && !selectedCustomer && (
                                <motion.p
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="text-xs text-amber-500 font-medium flex items-center gap-1.5 mt-2"
                                >
                                    <AlertCircle className="h-3 w-3" />
                                    Customer selection required for Udhaar transactions
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Notes */}
                    <div className="grid w-full items-center gap-2">
                        <Label htmlFor="notes" className="text-sm font-medium">Notes (Optional)</Label>
                        <Input
                            type="text"
                            id="notes"
                            placeholder="e.g. 5kg Rice, Milk"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="bg-background/50"
                        />
                    </div>

                    {/* Status Message */}
                    <AnimatePresence>
                        {formStatus.message && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <Alert variant={formStatus.type === 'error' ? 'destructive' : 'default'} className={`${formStatus.type === 'success' ? 'bg-green-500/15 border-green-500/30 text-green-600' : ''}`}>
                                    {formStatus.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                                    <AlertTitle>{formStatus.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
                                    <AlertDescription>{formStatus.message}</AlertDescription>
                                </Alert>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Submit Button */}
                    <Button
                        className="w-full h-12 text-lg shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all font-semibold"
                        onClick={handleRecordSale}
                        disabled={paymentMethod === 'UDHAAR' && !selectedCustomer}
                    >
                        Record Transaction
                    </Button>
                </CardContent>
            </Card>

            <CreditLimitWarning
                open={!!creditWarning}
                onOpenChange={(open) => !open && setCreditWarning(null)}
                data={creditWarning}
                onOverride={handleOverrideCreditLimit}
            />
        </div>
    );
}
