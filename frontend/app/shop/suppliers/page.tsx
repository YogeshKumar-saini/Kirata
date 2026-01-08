'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Package, Phone, Mail, MapPin, Edit, Trash2, Building2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { SupplierForm } from "@/components/shop/suppliers/supplier-form";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Supplier {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    createdAt: string;
    _count?: {
        products: number;
    };
}

export default function SuppliersPage() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [formOpen, setFormOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const { toast } = useToast();

    const fetchSuppliers = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/suppliers');
            setSuppliers(response.data);
        } catch (error: unknown) {
            console.error(error);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const err = error as any;
            toast({
                title: "Error",
                description: err.response?.data?.message || "Failed to load suppliers",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchSuppliers();
    }, [fetchSuppliers]);

    const handleEdit = (supplier: Supplier) => {
        setEditingSupplier(supplier);
        setFormOpen(true);
    };

    const handleDelete = async () => {
        if (!supplierToDelete) return;

        try {
            await api.delete(`/suppliers/${supplierToDelete.id}`);
            toast({
                title: "Success",
                description: "Supplier deleted successfully"
            });
            fetchSuppliers();
        } catch (error: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const err = error as any;
            toast({
                title: "Error",
                description: err.response?.data?.message || "Failed to delete supplier",
                variant: "destructive"
            });
        } finally {
            setDeleteDialogOpen(false);
            setSupplierToDelete(null);
        }
    };

    const handleFormClose = () => {
        setFormOpen(false);
        setEditingSupplier(null);
    };

    const handleFormSuccess = () => {
        fetchSuppliers();
        handleFormClose();
    };

    const filteredSuppliers = suppliers.filter(supplier =>
        supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supplier.phone?.includes(searchQuery) ||
        supplier.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="flex flex-col gap-8 pb-20 p-1"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                        Suppliers
                    </h1>
                    <p className="text-muted-foreground text-base md:text-lg mt-1">
                        Manage your product suppliers and vendors.
                    </p>
                </div>
                <Button
                    onClick={() => setFormOpen(true)}
                    className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 w-full md:w-auto"
                >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Supplier
                </Button>
            </div>

            {/* Search */}
            <div className="w-full md:w-96">
                <Input
                    placeholder="Search by name, phone, or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-card/40 border-white/10"
                />
            </div>

            <SupplierForm
                open={formOpen}
                onOpenChange={handleFormClose}
                onSuccess={handleFormSuccess}
                supplier={editingSupplier}
            />

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the supplier &quot;{supplierToDelete?.name}&quot;.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="relative h-12 w-12">
                        <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-t-primary rounded-full animate-spin"></div>
                    </div>
                    <p className="text-muted-foreground animate-pulse">Loading suppliers...</p>
                </div>
            ) : filteredSuppliers.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/10 rounded-3xl bg-white/5 text-center"
                >
                    <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                        <Building2 className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">
                        {searchQuery ? "No suppliers found" : "No Suppliers Yet"}
                    </h3>
                    <p className="text-muted-foreground max-w-md mb-8 text-lg">
                        {searchQuery
                            ? "Try adjusting your search query"
                            : "Add your first supplier to start managing your product sources."}
                    </p>
                    {!searchQuery && (
                        <Button size="lg" onClick={() => setFormOpen(true)} className="shadow-xl">
                            <PlusCircle className="mr-2 h-4 w-4" /> Add First Supplier
                        </Button>
                    )}
                </motion.div>
            ) : (
                <motion.div
                    variants={containerVariants}
                    className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
                >
                    <AnimatePresence>
                        {filteredSuppliers.map((supplier) => (
                            <motion.div
                                key={supplier.id}
                                variants={itemVariants}
                                layout
                            >
                                <Card className="glass border-white/10 bg-card/40 hover:bg-card/60 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 group">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                                    <Building2 className="h-6 w-6 text-primary" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                                                        {supplier.name}
                                                    </CardTitle>
                                                    {supplier._count && (
                                                        <Badge variant="secondary" className="mt-1 text-xs">
                                                            <Package className="h-3 w-3 mr-1" />
                                                            {supplier._count.products} products
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {supplier.phone && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Phone className="h-4 w-4" />
                                                <span>{supplier.phone}</span>
                                            </div>
                                        )}
                                        {supplier.email && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Mail className="h-4 w-4" />
                                                <span className="truncate">{supplier.email}</span>
                                            </div>
                                        )}
                                        {supplier.address && (
                                            <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                                <span className="line-clamp-2">{supplier.address}</span>
                                            </div>
                                        )}

                                        <div className="flex gap-2 pt-3 border-t border-white/5">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1 border-white/10 hover:bg-white/5"
                                                onClick={() => handleEdit(supplier)}
                                            >
                                                <Edit className="h-3.5 w-3.5 mr-1" />
                                                Edit
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1 border-red-500/20 text-red-500 hover:bg-red-500/10 hover:text-red-400"
                                                onClick={() => {
                                                    setSupplierToDelete(supplier);
                                                    setDeleteDialogOpen(true);
                                                }}
                                            >
                                                <Trash2 className="h-3.5 w-3.5 mr-1" />
                                                Delete
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}
        </motion.div>
    );
}
