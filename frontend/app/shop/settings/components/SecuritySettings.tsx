'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, KeyRound } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { TransactionPinDialog } from "@/components/security/transaction-pin-dialog";

export function SecuritySettings() {
    const { toast } = useToast();
    const [showPinDialog, setShowPinDialog] = useState(false);

    return (
        <Card className="border-border/40 dark:border-white/5 bg-card/40 backdrop-blur-xl">
            <CardHeader>
                <CardTitle>Security & Access</CardTitle>
                <CardDescription>Manage your security preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/20 dark:bg-white/5 border border-border/10">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center">
                            <KeyRound className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="font-medium">Transaction PIN</p>
                            <p className="text-sm text-muted-foreground">Required for sensitive actions like refunds or deletions.</p>
                        </div>
                    </div>
                    <Button variant="outline" onClick={() => setShowPinDialog(true)} className="border-border/20 dark:border-white/10">
                        Reset PIN
                    </Button>
                </div>

                <TransactionPinDialog
                    open={showPinDialog}
                    onOpenChange={setShowPinDialog}
                    mode="set"
                    onSuccess={() => {
                        toast({ title: "PIN Updated", description: "Your transaction PIN has been updated successfully." });
                    }}
                />
            </CardContent>
        </Card>
    );
}
