'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, MapPin, Phone, Mail } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { shopService, Shop } from "@/services/shop-service";

interface LocationSettingsProps {
    shop: Shop;
    onUpdate: (updatedShop: Shop) => void;
}

export function LocationSettings({ shop, onUpdate }: LocationSettingsProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        addressLine1: shop.addressLine1 || '',
        addressLine2: shop.addressLine2 || '',
        city: shop.city || '',
        state: shop.state || '',
        pincode: shop.pincode || '',
        phone: shop.phone || '',
        alternatePhone: shop.alternatePhone || '',
        email: shop.email || '',
        whatsappNumber: shop.whatsappNumber || '',
        gstNumber: shop.gstNumber || ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await shopService.updateShop(formData);
            onUpdate({ ...shop, ...formData });
            toast({ title: "Settings Saved", description: "Location & Contact details updated." });
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to save details.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-border/40 dark:border-white/5 bg-card/40 backdrop-blur-xl">
            <CardHeader>
                <CardTitle>Location & Contact</CardTitle>
                <CardDescription>How customers can find and reach you.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* Contact Section */}
                <div className="space-y-4">
                    <h3 className="text-sm font-medium flex items-center gap-2 text-primary">
                        <Phone className="h-4 w-4" /> Contact Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="bg-muted/10 dark:bg-black/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                            <Input
                                id="whatsappNumber"
                                name="whatsappNumber"
                                value={formData.whatsappNumber}
                                onChange={handleChange}
                                placeholder="e.g. +91 9876543210"
                                className="bg-muted/10 dark:bg-black/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                type="email"
                                className="bg-muted/10 dark:bg-black/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="gstNumber">GST Number</Label>
                            <Input
                                id="gstNumber"
                                name="gstNumber"
                                value={formData.gstNumber}
                                onChange={handleChange}
                                placeholder="GSTIN..."
                                className="bg-muted/10 dark:bg-black/20"
                            />
                        </div>
                    </div>
                </div>

                <div className="h-px bg-border/40 dark:bg-white/5 w-full my-4" />

                {/* Address Section */}
                <div className="space-y-4">
                    <h3 className="text-sm font-medium flex items-center gap-2 text-primary">
                        <MapPin className="h-4 w-4" /> Address Details
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="addressLine1">Address Line 1</Label>
                            <Input
                                id="addressLine1"
                                name="addressLine1"
                                value={formData.addressLine1}
                                onChange={handleChange}
                                className="bg-muted/10 dark:bg-black/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
                            <Input
                                id="addressLine2"
                                name="addressLine2"
                                value={formData.addressLine2}
                                onChange={handleChange}
                                className="bg-muted/10 dark:bg-black/20"
                            />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="city">City</Label>
                                <Input
                                    id="city"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="bg-muted/10 dark:bg-black/20"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="state">State</Label>
                                <Input
                                    id="state"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    className="bg-muted/10 dark:bg-black/20"
                                />
                            </div>
                            <div className="space-y-2 col-span-2 md:col-span-1">
                                <Label htmlFor="pincode">Pincode</Label>
                                <Input
                                    id="pincode"
                                    name="pincode"
                                    value={formData.pincode}
                                    onChange={handleChange}
                                    className="bg-muted/10 dark:bg-black/20"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <Button onClick={handleSave} disabled={loading} className="bg-primary hover:bg-primary/90">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
