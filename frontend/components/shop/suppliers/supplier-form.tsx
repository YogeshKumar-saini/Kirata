'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

interface Supplier {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
}

interface SupplierFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    supplier?: Supplier | null;
}

export function SupplierForm({ open, onOpenChange, onSuccess, supplier }: SupplierFormProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        address: ""
    });
    const { toast } = useToast();

    useEffect(() => {
        if (supplier) {
            setFormData({
                name: supplier.name || "",
                phone: supplier.phone || "",
                email: supplier.email || "",
                address: supplier.address || ""
            });
        } else {
            setFormData({
                name: "",
                phone: "",
                email: "",
                address: ""
            });
        }
    }, [supplier, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast({
                title: "Validation Error",
                description: "Supplier name is required",
                variant: "destructive"
            });
            return;
        }

        try {
            setLoading(true);

            const payload = {
                name: formData.name.trim(),
                phone: formData.phone.trim() || undefined,
                email: formData.email.trim() || undefined,
                address: formData.address.trim() || undefined
            };

            if (supplier) {
                // Update existing supplier
                await api.patch(`/suppliers/${supplier.id}`, payload);
                toast({
                    title: "Success",
                    description: "Supplier updated successfully"
                });
            } else {
                // Create new supplier
                await api.post('/suppliers', payload);
                toast({
                    title: "Success",
                    description: "Supplier added successfully"
                });
            }

            onSuccess();
        } catch (error: unknown) {
            console.error(error);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const err = error as any;
            toast({
                title: "Error",
                description: err.response?.data?.message || `Failed to ${supplier ? 'update' : 'add'} supplier`,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {supplier ? "Edit Supplier" : "Add New Supplier"}
                    </DialogTitle>
                    <DialogDescription>
                        {supplier
                            ? "Update the supplier details below."
                            : "Add a new supplier to manage your product sources."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">
                            Supplier Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="name"
                            placeholder="e.g., ABC Distributors"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            disabled={loading}
                            className="bg-card/40 border-white/10"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="e.g., +91 98765 43210"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            disabled={loading}
                            className="bg-card/40 border-white/10"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="e.g., supplier@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            disabled={loading}
                            className="bg-card/40 border-white/10"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Textarea
                            id="address"
                            placeholder="e.g., 123 Market Street, City, State - 123456"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            disabled={loading}
                            rows={3}
                            className="bg-card/40 border-white/10 resize-none"
                        />
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                            className="border-white/10"
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {supplier ? "Update Supplier" : "Add Supplier"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
