"use client";

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import api from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface AddLedgerEntryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    initialPhone?: string;
    initialName?: string;
    initialAmount?: string;
    initialType?: 'GAVE' | 'TOOK';
}

export function AddLedgerEntryDialog({
    open,
    onOpenChange,
    onSuccess,
    initialPhone = '',
    initialName = '',
    initialAmount = '',
    initialType = 'GAVE'
}: AddLedgerEntryDialogProps) {
    const [phone, setPhone] = useState(initialPhone);
    const [name, setName] = useState(initialName);
    const [amount, setAmount] = useState(initialAmount);
    const [type, setType] = useState<'GAVE' | 'TOOK'>(initialType);
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { toast } = useToast();

    // Reset form when dialog opens or initial values change
    React.useEffect(() => {
        if (open) {
            setPhone(initialPhone);
            setName(initialName);
            setAmount(initialAmount || '');
            setType(initialType);
            setNotes('');
        }
    }, [open, initialPhone, initialName, initialAmount, initialType]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!phone || !name || !amount) {
            toast({
                title: "Error",
                description: "Please fill in all required fields",
                variant: "destructive"
            });
            return;
        }

        setSubmitting(true);
        try {
            await api.post('/personal-ledger/entries', {
                contactPhone: phone,
                contactName: name,
                amount: parseFloat(amount),
                type,
                notes
            });

            toast({
                title: "Success",
                description: `Entry recorded for ${name}`,
            });

            // Reset form
            setPhone('');
            setName('');
            setAmount('');
            setNotes('');

            onOpenChange(false);
            onSuccess();
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Failed to Add Entry",
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                description: (error as any).response?.data?.message || "Please try again later.",
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Add Ledger Entry</DialogTitle>
                        <DialogDescription>
                            Record a transaction with anyone. If they are on Kirata, we&apos;ll sync records smartly.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                placeholder="9988xxxxxx"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                disabled={!!initialPhone}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name / Shop Name</Label>
                            <Input
                                id="name"
                                placeholder="Contact Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={!!initialName}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="amount">Amount (₹)</Label>
                            <Input
                                id="amount"
                                type="number"
                                placeholder="Enter the amount you've paid or received."
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Transaction Type</Label>
                            <RadioGroup value={type} onValueChange={(v: 'GAVE' | 'TOOK') => setType(v)} className="flex gap-4">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="GAVE" id="gave" className="text-red-600" />
                                    <Label htmlFor="gave" className="text-red-600 font-bold">I GAVE (You take)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="TOOK" id="took" className="text-green-600" />
                                    <Label htmlFor="took" className="text-green-600 font-bold">I TOOK (You give)</Label>
                                </div>
                            </RadioGroup>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="notes">Notes (Optional)</Label>
                            <Textarea
                                id="notes"
                                placeholder="Details about this transaction..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={submitting} className="w-full">
                            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Record Transaction
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
