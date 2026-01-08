'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { shopService } from "@/services/shop-service";
import { useRouter } from 'next/navigation';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function DangerZoneSettings() {
    const { toast } = useToast();
    const router = useRouter();
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await shopService.deleteShop();
            toast({ title: "Shop Deleted", description: "Your shop has been deleted. Redirecting..." });
            router.push('/'); // Redirect to home or setup
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to delete shop. Check if you have active orders.", variant: "destructive" });
            setDeleting(false);
        }
    };

    return (
        <Card className="border-red-500/20 bg-red-500/5 backdrop-blur-xl">
            <CardHeader>
                <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" /> Danger Zone
                </CardTitle>
                <CardDescription>Irreversible actions. Proceed with caution.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                    <div>
                        <h4 className="font-medium text-red-900 dark:text-red-200">Delete this Shop</h4>
                        <p className="text-sm text-red-700 dark:text-red-400">
                            Permanently remove your shop, products, and customers.
                        </p>
                    </div>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your shop and remove your data from our servers.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                                    {deleting ? "Deleting..." : "Yes, Delete Shop"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </CardContent>
        </Card>
    );
}
