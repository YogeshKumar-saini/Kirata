"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

interface PinDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: (pin: string) => void;
    title?: string;
    description?: string;
}

export function PinDialog({ open, onOpenChange, onSuccess, title = "Security Verification", description = "Please enter your 4-digit Transaction PIN to continue." }: PinDialogProps) {
    const [pin, setPin] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!pin || pin.length !== 4) {
            setError("Please enter a valid 4-digit PIN");
            return;
        }

        setLoading(true);
        // Simulate a small delay for UX or potential pre-check
        // In this architecture, we pass the PIN to the parent to send with the actual request
        setTimeout(() => {
            setLoading(false);
            onSuccess(pin);
            setPin(""); // Reset
        }, 300);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5 text-yellow-600" />
                        {title}
                    </DialogTitle>
                    <DialogDescription>
                        {description}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="flex flex-col gap-2 items-center">
                        <Input
                            type="password"
                            maxLength={4}
                            className="text-center text-3xl tracking-[1em] h-16 w-48 font-mono"
                            value={pin}
                            onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                            placeholder="••••"
                            autoFocus
                        />
                        {error && <p className="text-sm text-red-500">{error}</p>}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading || pin.length !== 4}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                "Confirm"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
