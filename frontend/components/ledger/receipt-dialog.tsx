"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Download, Printer } from "lucide-react"
import api from "@/lib/api"

interface ReceiptTransaction {
    saleId: string;
    amount: number;
    paymentType: string;
    createdAt: string;
    customer?: {
        name: string | null;
    } | null;
}

interface ReceiptDialogProps {
    transaction: ReceiptTransaction; // Using specific interface
    open: boolean;
    onOpenChange: (open: boolean) => void;
    endpoint?: string;
}

export function ReceiptDialog({ transaction, open, onOpenChange, endpoint }: ReceiptDialogProps) {
    const [downloading, setDownloading] = useState(false);

    if (!transaction) return null;

    const handleDownload = async () => {
        try {
            setDownloading(true);
            const url = endpoint || `/ledger/transaction/${transaction.saleId}/receipt`;
            const response = await api.get(url, {
                responseType: 'blob'
            });

            const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', `receipt-${transaction.saleId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Failed to download receipt", error);
        } finally {
            setDownloading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Transaction Receipt</DialogTitle>
                    <DialogDescription>
                        View and download receipt for this transaction.
                    </DialogDescription>
                </DialogHeader>

                <div className="border rounded-md p-6 bg-white dark:bg-gray-900 space-y-4 text-sm shadow-sm my-4">
                    <div className="text-center border-b pb-4 mb-4">
                        <div className="font-bold text-lg">Shop Receipt</div>
                        <div className="text-xs text-muted-foreground">{new Date(transaction.createdAt).toLocaleString()}</div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Receipt #:</span>
                            <span className="font-mono">{transaction.saleId.substring(0, 8).toUpperCase()}</span>
                        </div>
                        {transaction.customer && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Customer:</span>
                                <span>{transaction.customer.name}</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Payment:</span>
                            <span>{transaction.paymentType}</span>
                        </div>
                    </div>

                    <div className="border-t pt-2 mt-4 flex justify-between items-center font-bold text-lg">
                        <span>Total:</span>
                        <span>₹{Number(transaction.amount).toFixed(2)}</span>
                    </div>
                </div>

                <DialogFooter className="flex gap-2 sm:justify-between">
                    <Button variant="outline" onClick={() => window.print()} className="w-full">
                        <Printer className="mr-2 h-4 w-4" />
                        Print
                    </Button>
                    <Button onClick={handleDownload} disabled={downloading} className="w-full">
                        <Download className="mr-2 h-4 w-4" />
                        {downloading ? 'Downloading...' : 'Download PDF'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
