'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import api from "@/lib/api";

interface Supplier {
    id: string;
    name: string;
}

interface SupplierManagerProps {
    value: string;
    onChange: (value: string) => void;
}

export function SupplierManager({ value, onChange }: SupplierManagerProps) {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [newSupplierName, setNewSupplierName] = useState('');
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/suppliers');
            setSuppliers(response.data);
        } catch (error) {
            console.error('Failed to fetch suppliers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSupplier = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSupplierName.trim()) return;

        try {
            setCreating(true);
            const response = await api.post('/suppliers', {
                name: newSupplierName
            });
            const newSupplier = response.data;
            setSuppliers([newSupplier, ...suppliers]);
            onChange(newSupplier.id); // Auto-select new supplier
            setNewSupplierName('');
            setOpen(false);
        } catch (error) {
            console.error('Failed to create supplier:', error);
            alert('Failed to create supplier');
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="flex gap-2">
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger className="w-full bg-background/50">
                    <SelectValue placeholder="Select Supplier" />
                </SelectTrigger>
                <SelectContent>
                    {loading ? (
                        <div className="flex items-center justify-center p-2">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Loading...
                        </div>
                    ) : suppliers.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground text-center">No suppliers found</div>
                    ) : (
                        suppliers.map((supplier) => (
                            <SelectItem key={supplier.id} value={supplier.id}>
                                {supplier.name}
                            </SelectItem>
                        ))
                    )}
                </SelectContent>
            </Select>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="icon" title="Add New Supplier" className="bg-background/50">
                        <Plus className="h-4 w-4" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="glass border-sidebar-border/50">
                    <DialogHeader>
                        <DialogTitle>Add New Supplier</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateSupplier} className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="supplier-name">Supplier Name</Label>
                            <Input
                                id="supplier-name"
                                value={newSupplierName}
                                onChange={(e) => setNewSupplierName(e.target.value)}
                                placeholder="Enter supplier name"
                                required
                                className="bg-background/50"
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={creating} className="shadow-lg shadow-primary/20">
                                {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Supplier
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
