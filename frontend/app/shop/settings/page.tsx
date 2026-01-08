'use client';

import { useState, useEffect, useCallback } from 'react';
import { shopService, Shop } from "@/services/shop-service";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { Loader2, Store, MapPin, Clock, Shield, AlertTriangle, Menu, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import { GeneralSettings } from './components/GeneralSettings';
import { LocationSettings } from './components/LocationSettings';
import { BusinessHoursSettings } from './components/BusinessHoursSettings';
import { SecuritySettings } from './components/SecuritySettings';
import { DangerZoneSettings } from './components/DangerZoneSettings';

export default function SettingsPage() {
    const { toast } = useToast();
    const [shop, setShop] = useState<Shop | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("general");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const loadShopDetails = useCallback(async () => {
        try {
            const data = await shopService.getMyShop();
            setShop(data);
        } catch (error) {
            console.error("Failed to load shop details", error);
            toast({
                title: "Error",
                description: "Failed to load shop details",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        loadShopDetails();
    }, [loadShopDetails]);

    const handleShopUpdate = (updatedShop: Shop) => {
        setShop(updatedShop);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!shop) return null;

    const menuItems = [
        { id: "general", label: "General", icon: Store },
        { id: "location", label: "Location & Contact", icon: MapPin },
        { id: "business-hours", label: "Business Hours", icon: Clock },
        { id: "profile", label: "My Profile", icon: User }, // Added Profile Link
        { id: "security", label: "Security", icon: Shield },
        { id: "danger", label: "Danger Zone", icon: AlertTriangle, variant: "destructive" },
    ];

    const SidebarContent = () => (
        <div className="flex flex-col gap-2">
            {menuItems.map((item) => (
                <Button
                    key={item.id}
                    variant={activeTab === item.id ? "secondary" : "ghost"}
                    className={`justify-start gap-3 ${activeTab === item.id ? 'bg-primary/10 text-primary hover:bg-primary/15' : ''} ${item.variant === 'destructive' ? 'text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10' : ''}`}
                    onClick={() => {
                        setActiveTab(item.id);
                        setIsMobileMenuOpen(false);
                    }}
                >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                </Button>
            ))}
        </div>
    );

    return (
        <div className="container max-w-6xl py-6 pb-20 space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 dark:from-white dark:to-white/70">
                    Settings
                </h1>
                <p className="text-muted-foreground">
                    Manage your shop profile, preferences, and account settings.
                </p>
            </div>

            <Separator className="my-6" />

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Mobile Menu Trigger */}
                <div className="lg:hidden">
                    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <Button variant="outline" className="w-full justify-between">
                                <span className="flex items-center gap-2">
                                    <Menu className="h-4 w-4" />
                                    Menu
                                </span>
                                <span className="text-xs text-muted-foreground capitalize">
                                    {menuItems.find(i => i.id === activeTab)?.label}
                                </span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                            <div className="py-6">
                                <h2 className="mb-4 text-lg font-semibold tracking-tight">Settings</h2>
                                <SidebarContent />
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>

                {/* Desktop Sidebar */}
                <aside className="hidden lg:block w-[250px] shrink-0">
                    <div className="sticky top-24">
                        <SidebarContent />
                    </div>
                </aside>

                {/* Content Area */}
                <div className="flex-1 min-w-0">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                        {activeTab === "profile" && (
                            <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center p-8 rounded-xl border border-dashed border-border/40">
                                <User className="h-12 w-12 text-muted-foreground/50" />
                                <div>
                                    <h3 className="font-semibold text-lg">Shopkeeper Profile</h3>
                                    <p className="text-muted-foreground max-w-sm mx-auto mb-4">
                                        Manage your personal account details, password, and active sessions in your profile.
                                    </p>
                                    <Button onClick={() => window.location.href = '/shop/profile'}>
                                        Go to My Profile
                                    </Button>
                                </div>
                            </div>
                        )}
                        {activeTab === "general" && (
                            <GeneralSettings shop={shop} onUpdate={handleShopUpdate} />
                        )}
                        {activeTab === "location" && (
                            <LocationSettings shop={shop} onUpdate={handleShopUpdate} />
                        )}
                        {activeTab === "business-hours" && (
                            <BusinessHoursSettings shop={shop} onUpdate={handleShopUpdate} />
                        )}
                        {activeTab === "security" && (
                            <SecuritySettings />
                        )}
                        {activeTab === "danger" && (
                            <DangerZoneSettings />
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
