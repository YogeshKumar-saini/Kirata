"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Customer {
    name: string | null | undefined;
    creditLimit?: number;
    tags?: string[];
    notes?: string;
}

interface CustomerUpdateData {
    name: string;
    creditLimit: number | null;
    tags: string[];
    notes: string;
}

interface CustomerEditDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    customer: Customer | null;
    onSave: (data: CustomerUpdateData) => Promise<void>;
}

export function CustomerEditDialog({ open, onOpenChange, customer, onSave }: CustomerEditDialogProps) {
    const [name, setName] = useState(customer?.name || '');
    const [creditLimit, setCreditLimit] = useState(customer?.creditLimit || '');
    const [notes, setNotes] = useState(customer?.notes || '');
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState<string[]>(customer?.tags || []);
    const [loading, setLoading] = useState(false);

    // Update state when customer changes
    const handleOpenChange = (isOpen: boolean) => {
        if (isOpen && customer) {
            setName(customer.name || '');
            setCreditLimit(customer.creditLimit || '');
            setNotes(customer.notes || '');
            setTags(customer.tags || []);
        }
        onOpenChange(isOpen);
    };

    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (!tags.includes(tagInput.trim())) {
                setTags([...tags, tagInput.trim()]);
            }
            setTagInput('');
        }
    };

    const removeTag = (tag: string) => {
        setTags(tags.filter(t => t !== tag));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave({
                name,
                creditLimit: creditLimit ? Number(creditLimit) : null,
                tags,
                notes
            });
            onOpenChange(false);
        } catch (error) {
            console.error('Failed to update customer', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Customer</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Customer Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Customer Name"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="creditLimit">Credit Limit (₹)</Label>
                        <Input
                            id="creditLimit"
                            type="number"
                            value={creditLimit}
                            onChange={(e) => setCreditLimit(e.target.value)}
                            placeholder="Optional credit limit"
                        />
                    </div>

                    {/* Tags Input */}
                    <div className="space-y-2">
                        <Label>Tags</Label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                                    {tag}
                                    <X
                                        className="h-3 w-3 cursor-pointer hover:text-red-500"
                                        onClick={() => removeTag(tag)}
                                    />
                                </Badge>
                            ))}
                        </div>
                        <Input
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleAddTag}
                            placeholder="Type tag and press Enter"
                        />
                        <p className="text-xs text-muted-foreground">Press Enter to add tags</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add notes about this customer..."
                            className="min-h-[100px]"
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
