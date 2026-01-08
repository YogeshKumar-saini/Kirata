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
import { Loader2, X } from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

interface Customer {
    id: string;
    name: string | null;
    phone: string | null;
    email?: string | null;
    creditLimit?: number | null;
    tags?: string[];
    notes?: string | null;
}

interface CustomerEditDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    customer: Customer;
}

export function CustomerEditDialog({ open, onOpenChange, onSuccess, customer }: CustomerEditDialogProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        creditLimit: "",
        tags: [] as string[],
        notes: ""
    });
    const [newTag, setNewTag] = useState("");
    const { toast } = useToast();

    useEffect(() => {
        if (customer && open) {
            setFormData({
                name: customer.name || "",
                creditLimit: customer.creditLimit?.toString() || "",
                tags: customer.tags || [],
                notes: customer.notes || ""
            });
        }
    }, [customer, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);

            const payload = {
                name: formData.name.trim() || undefined,
                creditLimit: formData.creditLimit ? parseFloat(formData.creditLimit) : null,
                tags: formData.tags.length > 0 ? formData.tags : undefined,
                notes: formData.notes.trim() || undefined
            };

            await api.patch(`/shop/customers/${customer.id}`, payload);

            toast({
                title: "Success",
                description: "Customer details updated successfully"
            });

            onSuccess();
        } catch (error: unknown) {
            console.error(error);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const err = error as any;
            toast({
                title: "Error",
                description: err.response?.data?.message || "Failed to update customer",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const addTag = () => {
        if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
            setFormData({
                ...formData,
                tags: [...formData.tags, newTag.trim()]
            });
            setNewTag("");
        }
    };

    const removeTag = (tagToRemove: string) => {
        setFormData({
            ...formData,
            tags: formData.tags.filter(tag => tag !== tagToRemove)
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Customer Details</DialogTitle>
                    <DialogDescription>
                        Update customer information, credit limit, and tags.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Customer Name</Label>
                        <Input
                            id="name"
                            placeholder="e.g., John Doe"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            disabled={loading}
                            className="bg-card/40 border-white/10"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="creditLimit">Credit Limit (₹)</Label>
                        <Input
                            id="creditLimit"
                            type="number"
                            step="0.01"
                            placeholder="e.g., 10000"
                            value={formData.creditLimit}
                            onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                            disabled={loading}
                            className="bg-card/40 border-white/10"
                        />
                        <p className="text-xs text-muted-foreground">
                            Maximum credit amount allowed for this customer
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="tags">Tags</Label>
                        <div className="flex gap-2">
                            <Input
                                id="tags"
                                placeholder="Add a tag (e.g., VIP, Regular)"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addTag();
                                    }
                                }}
                                disabled={loading}
                                className="bg-card/40 border-white/10"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={addTag}
                                disabled={loading || !newTag.trim()}
                                className="border-white/10"
                            >
                                Add
                            </Button>
                        </div>
                        {formData.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {formData.tags.map((tag) => (
                                    <Badge
                                        key={tag}
                                        variant="secondary"
                                        className="pl-3 pr-1 py-1 gap-1"
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => removeTag(tag)}
                                            className="ml-1 hover:bg-white/10 rounded-full p-0.5"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            placeholder="Add any notes about this customer..."
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
