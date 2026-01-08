"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Bell, Loader2, MessageSquare } from "lucide-react";
import api from "@/lib/api";

interface ReminderDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    customerId: string;
    customerName: string;
    outstandingBalance: number;
}

export function ReminderDialog({ open, onOpenChange, customerId, customerName, outstandingBalance }: ReminderDialogProps) {
    const [loading, setLoading] = useState(false);
    const [type, setType] = useState('payment');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/notifications/remind/payment', {
                customerId,
                amount: outstandingBalance
            });
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                onOpenChange(false);
            }, 1500);
        } catch (error) {
            console.error('Failed to send reminder', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Send Reminder
                    </DialogTitle>
                    <DialogDescription>
                        Send a notification to {customerName} via SMS/WhatsApp.
                    </DialogDescription>
                </DialogHeader>

                {success ? (
                    <div className="py-6 flex flex-col items-center justify-center text-green-600 gap-2">
                        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                            <Bell className="h-6 w-6" />
                        </div>
                        <p className="font-medium">Reminder Sent!</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <RadioGroup defaultValue="payment" value={type} onValueChange={setType}>
                            <div className="flex items-center space-x-2 border p-3 rounded-md has-[:checked]:border-primary">
                                <RadioGroupItem value="payment" id="r1" />
                                <Label htmlFor="r1" className="cursor-pointer flex-1">
                                    <div className="font-medium">Payment Due</div>
                                    <div className="text-xs text-muted-foreground">
                                        Reminder to pay ₹{outstandingBalance.toFixed(2)}
                                    </div>
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2 border p-3 rounded-md has-[:checked]:border-primary alpha-50 opacity-50 cursor-not-allowed">
                                <RadioGroupItem value="custom" id="r2" disabled />
                                <Label htmlFor="r2" className="cursor-not-allowed flex-1">
                                    <div className="font-medium">Custom Message</div>
                                    <div className="text-xs text-muted-foreground">
                                        Write your own message (Coming Soon)
                                    </div>
                                </Label>
                            </div>
                        </RadioGroup>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <MessageSquare className="mr-2 h-4 w-4" />
                                        Send SMS/WhatsApp
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
