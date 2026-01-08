import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useState } from "react"
import api from "@/lib/api"
import { AlertCircle, Loader2 } from "lucide-react"

interface BulkEditDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    saleIds: string[];
    onSuccess: () => void;
}

export function BulkEditDialog({ open, onOpenChange, saleIds, onSuccess }: BulkEditDialogProps) {
    const [paymentType, setPaymentType] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSave = async () => {
        if (!paymentType) return;

        setLoading(true);
        setError(null);

        try {
            await api.patch('/ledger/transaction/bulk', {
                saleIds,
                paymentType
            });
            onSuccess();
            onOpenChange(false);
            setPaymentType("");
        } catch (err) {
            console.error("Bulk edit failed", err);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setError((err as any).response?.data?.error || "Failed to update transactions. Ensure all transactions are valid for this change.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Bulk Edit Transactions</DialogTitle>
                    <DialogDescription>
                        Update {saleIds.length} selected transaction{saleIds.length !== 1 ? 's' : ''}.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label>Change Payment Type</Label>
                        <Select value={paymentType} onValueChange={setPaymentType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select new payment type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="CASH">Cash</SelectItem>
                                <SelectItem value="UPI">UPI</SelectItem>
                                <SelectItem value="UDHAAR">Udhaar (Credit)</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            Note: Changing to Udhaar requires the transaction to have a customer assigned.
                        </p>
                    </div>

                    {error && (
                        <div className="flex items-start gap-2 p-3 text-sm text-red-600 bg-red-50 rounded-md">
                            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={!paymentType || loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Update Transactions
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
