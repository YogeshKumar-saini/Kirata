"use client"

import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface CreditLimitWarningProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    data: {
        currentBalance: number;
        creditLimit: number;
        projectedBalance: number;
        exceededBy: number;
        message?: string;
    } | null;
    onOverride: () => void;
}

export function CreditLimitWarning({ open, onOpenChange, data, onOverride }: CreditLimitWarningProps) {
    if (!data) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <div className="flex items-center gap-2 text-amber-600 mb-2">
                        <AlertTriangle className="h-6 w-6" />
                        <DialogTitle>Credit Limit Exceeded</DialogTitle>
                    </div>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <p className="text-sm text-gray-500">
                        This transaction will exceed the customer&apos;s credit limit.
                    </p>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex flex-col gap-1">
                            <span className="text-muted-foreground">Credit Limit</span>
                            <span className="font-semibold">₹{data.creditLimit.toFixed(2)}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-muted-foreground">Current Balance</span>
                            <span className="font-medium">₹{data.currentBalance.toFixed(2)}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-muted-foreground">New Balance</span>
                            <span className="font-semibold text-red-600">₹{data.projectedBalance.toFixed(2)}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-muted-foreground">Exceeded By</span>
                            <span className="font-semibold text-red-600">₹{data.exceededBy.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-sm text-amber-800">
                        Proceeding will override the limit. This action will be logged.
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={onOverride}>
                        Override & Record
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
