'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/context/auth-context';
import api from '@/lib/api';
import { Loader2, LogOut, Store, MapPin, Phone, Building2, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/components/ui/use-toast";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AddressSearch } from '@/components/shop/address-search';

const shopSchema = z.object({
    name: z.string().min(2, "Shop name must be at least 2 characters."),
    category: z.enum(["GROCERY", "MEDICAL", "HARDWARE", "OTHER"]),
    phone: z.string().regex(/^\+91[6-9]\d{9}$/, "Phone number must be +91 followed by 10 digits"),
    addressLine1: z.string().min(5, "Address must be at least 5 characters."),
    city: z.string().min(2, "City is required."),
    state: z.string().min(2, "State is required."),
    pincode: z.string().regex(/^\d{6}$/, "Pincode must be exactly 6 digits."),
    gstNumber: z.string().regex(/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}\d[Z]{1}[A-Z\d]{1}$/, "Invalid GST number format").optional().or(z.literal("")),
});

type ShopFormValues = z.infer<typeof shopSchema>;

export default function ShopSetupPage() {
    const { user, refreshProfile, logout } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [checkingExistingShop, setCheckingExistingShop] = useState(true);

    const form = useForm<ShopFormValues>({
        resolver: zodResolver(shopSchema),
        defaultValues: {
            name: "",
            category: "GROCERY",
            phone: user?.phone?.startsWith('+91') ? user.phone : (user?.phone ? `+91${user.phone}` : ""),
            addressLine1: "",
            city: "",
            state: "",
            pincode: "",
            gstNumber: "",
        },
    });

    useEffect(() => {
        const checkExistingShop = async () => {
            try {
                const response = await api.get('/shops/my');
                if (response.data && response.data.length > 0) {
                    toast({
                        title: "Shop Already Exists",
                        description: "Redirecting to your dashboard...",
                    });
                    router.push('/shop');
                } else {
                    setCheckingExistingShop(false);
                }
            } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
                // If 404 or empty list, it means no shop found, which is correct
                setCheckingExistingShop(false);
            }
        };
        checkExistingShop();
    }, [router, toast]);

    async function onSubmit(data: ShopFormValues) {
        setIsLoading(true);
        try {
            await api.post('/shops', data);
            await refreshProfile();
            toast({
                title: "Setup Complete!",
                description: "Your shop has been created successfully.",
            });
            router.push('/shop');
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error("Failed to create shop", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: error.response?.data?.message || "Failed to create shop. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    }

    const handleAddressSelect = (address: {
        line1: string;
        city: string;
        state: string;
        pincode: string;
    }) => {
        form.setValue('addressLine1', address.line1);
        form.setValue('city', address.city);
        form.setValue('state', address.state);
        form.setValue('pincode', address.pincode);

        // Clear validation errors for these fields
        form.clearErrors(['addressLine1', 'city', 'state', 'pincode']);

        toast({
            title: "Address Auto-filled",
            description: "Please verify the details before proceeding.",
        });
    };

    if (checkingExistingShop) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-black">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground animate-pulse">Checking account status...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[url('/grid-pattern.svg')] bg-fixed bg-cover p-4 md:p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px]" />

            <div className="absolute top-4 right-4 z-50">
                <Button variant="ghost" onClick={logout} className="text-muted-foreground hover:text-white hover:bg-white/10">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                </Button>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "backOut" }}
                className="w-full max-w-2xl relative z-10"
            >
                <Card className="glass border-white/10 shadow-2xl bg-black/40 backdrop-blur-xl">
                    <CardHeader className="text-center pb-8 border-b border-white/5">
                        <div className="mx-auto h-16 w-16 bg-primary/20 rounded-full flex items-center justify-center mb-4 border border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.3)]">
                            <Store className="h-8 w-8 text-primary" />
                        </div>
                        <CardTitle className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-primary/50 to-white/50">
                            Setup Your Shop
                        </CardTitle>
                        <CardDescription className="text-lg">
                            Enter your business details to launch your digital store.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-8 px-6 md:px-10">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem className="md:col-span-2">
                                                <FormLabel>Shop Name</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Store className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                        <Input placeholder="e.g. Kirata Super Mart" className="pl-9 bg-white/5 border-white/10" {...field} />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="category"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Category</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="bg-white/5 border-white/10">
                                                            <SelectValue placeholder="Select a category" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="GROCERY">Grocery (Kirana)</SelectItem>
                                                        <SelectItem value="MEDICAL">Medical / Pharmacy</SelectItem>
                                                        <SelectItem value="HARDWARE">Hardware</SelectItem>
                                                        <SelectItem value="OTHER">Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Business Phone</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                        <Input placeholder="+91..." className="pl-9 bg-white/5 border-white/10" {...field} />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="md:col-span-2 space-y-2">
                                        <FormLabel>Search Address (Fast Fill)</FormLabel>
                                        <AddressSearch onSelect={handleAddressSelect} />
                                        <FormDescription className="text-xs">
                                            Search for your shop location to quickly fill address details.
                                        </FormDescription>
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="addressLine1"
                                        render={({ field }) => (
                                            <FormItem className="md:col-span-2">
                                                <FormLabel>Address</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                        <Textarea
                                                            placeholder="Shop No, Street, Landmark..."
                                                            className="pl-9 min-h-[80px] bg-white/5 border-white/10 resize-none"
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="city"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>City</FormLabel>
                                                <FormControl>
                                                    <Input className="bg-white/5 border-white/10" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="pincode"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Pincode</FormLabel>
                                                <FormControl>
                                                    <Input className="bg-white/5 border-white/10" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="state"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>State</FormLabel>
                                                <FormControl>
                                                    <Input className="bg-white/5 border-white/10" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="gstNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>GST Number (Optional)</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                        <Input placeholder="GSTIN..." className="pl-9 bg-white/5 border-white/10" {...field} />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full text-lg h-12 mt-4 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all hover:scale-[1.01]"
                                    disabled={isLoading}
                                >
                                    {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle2 className="mr-2 h-5 w-5" />}
                                    Launch Shop
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
