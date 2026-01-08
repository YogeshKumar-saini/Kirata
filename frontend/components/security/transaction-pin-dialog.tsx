"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import api from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface TransactionPinDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: 'set' | 'verify';
    onSuccess: () => void;
    title?: string;
    description?: string;
}

export function TransactionPinDialog({ open, onOpenChange, mode, onSuccess, title, description }: TransactionPinDialogProps) {
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async () => {
        if (pin.length < 4 || pin.length > 6) {
            toast({ variant: "destructive", title: "Invalid PIN", description: "PIN must be 4-6 digits" });
            return;
        }

        if (mode === 'set' && pin !== confirmPin) {
            toast({ variant: "destructive", title: "Mismatch", description: "PINs do not match" });
            return;
        }

        setLoading(true);
        try {
            if (mode === 'set') {
                await api.post('/auth/me/pin/set', { pin });
                toast({ title: "Success", description: "Transaction PIN set successfully" });
            } else {
                const res = await api.post('/auth/me/pin/verify', { pin });
                if (!res.data.isValid) {
                    throw new Error("Invalid PIN");
                }
            }
            onSuccess();
            onOpenChange(false);
            setPin('');
            setConfirmPin('');
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error(error);
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || error.response?.data?.message || "Operation failed",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{title || (mode === 'set' ? 'Set Transaction PIN' : 'Verify Transaction PIN')}</DialogTitle>
                    <DialogDescription>
                        {description || (mode === 'set' ? 'Create a 4-6 digit PIN for securing sensitive actions.' : 'Please enter your Transaction PIN to proceed.')}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Input
                            type="password"
                            placeholder="Enter PIN"
                            value={pin}
                            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            className="text-center text-2xl tracking-widest"
                            maxLength={6}
                        />
                    </div>
                    {mode === 'set' && (
                        <div className="space-y-2">
                            <Input
                                type="password"
                                placeholder="Confirm PIN"
                                value={confirmPin}
                                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="text-center text-2xl tracking-widest"
                                maxLength={6}
                            />
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmit} disabled={loading || pin.length < 4}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (mode === 'set' ? 'Set PIN' : 'Verify')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
