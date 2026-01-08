import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import api from "@/lib/api";
import { Loader2 } from "lucide-react";

interface BulkDeleteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    count: number;
    transactionIds: string[];
    onSuccess: () => void;
}

export function BulkDeleteDialog({
    open,
    onOpenChange,
    count,
    transactionIds,
    onSuccess
}: BulkDeleteDialogProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
        setLoading(true);
        setError(null);
        try {
            await api.delete('/ledger/transaction/bulk', {
                data: { ids: transactionIds }
            });
            onSuccess();
            onOpenChange(false);
        } catch (err: unknown) {
            console.error('Failed to delete transactions:', err);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const message = (err as any).response?.data?.error || 'Failed to delete transactions. Please try again.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete <span className="font-bold text-foreground">{count}</span> selected transactions and remove their data from our servers.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                {error && (
                    <div className="text-sm text-red-500 font-medium py-2">
                        {error}
                    </div>
                )}

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            handleDelete();
                        }}
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {loading ? 'Deleting...' : 'Delete Selected'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
