'use client';

import { useState } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { PinDialog } from '@/components/security/pin-dialog';

interface DeleteTransactionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    transactionId: string | null;
    onSuccess: () => void;
}

export function DeleteTransactionDialog({ open, onOpenChange, transactionId, onSuccess }: DeleteTransactionDialogProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pinDialogOpen, setPinDialogOpen] = useState(false);

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setError(null);
        setPinDialogOpen(true);
    };

    const handlePinSuccess = async (pin: string) => {
        setPinDialogOpen(false);
        if (!transactionId) return;

        try {
            setLoading(true);
            setError(null);

            await api.delete(`/ledger/transaction/${transactionId}`, {
                headers: {
                    'x-transaction-pin': pin
                }
            });

            onSuccess();
            onOpenChange(false);
        } catch (err: unknown) {
            console.error('Failed to delete transaction:', err);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const message = (err as any).response?.data?.message || 'Failed to delete transaction';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <AlertDialog open={open} onOpenChange={onOpenChange}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this transaction? This action cannot be undone.
                            {error && (
                                <div className="mt-2 text-sm text-red-600 bg-red-50 dark:bg-red-950/20 p-2 rounded-md">
                                    {error}
                                </div>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteClick}
                            disabled={loading}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <PinDialog
                open={pinDialogOpen}
                onOpenChange={setPinDialogOpen}
                onSuccess={handlePinSuccess}
                title="Security Check"
                description="Enter your PIN to confirm deletion."
            />
        </>
    );
}
