import React from 'react';
import { motion, Variants } from 'framer-motion';
import { User, MapPin, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { FloatingLabelInput } from '@/components/ui/floating-label-input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PremiumTilt } from '@/components/ui/PremiumTilt';
import { Spotlight } from '@/components/ui/Spotlight';

// Enhanced PersonalInfoCard with granular fields
interface PersonalInfoCardProps {
    formData: {
        name: string;
        address: string; // Keep for backward compatibility or display
        addressLine1: string;
        addressLine2: string;
        city: string;
        state: string;
        pincode: string;
        gender: string;
        dateOfBirth: string;
    };
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    handleSubmit: (e: React.FormEvent) => void;
    saving: boolean;
    variants: Variants;
}

export const PersonalInfoCard = ({ formData, handleChange, handleSubmit, saving, variants }: PersonalInfoCardProps) => {
    return (
        <PremiumTilt className="lg:col-span-2 h-full">
            <motion.div variants={variants} className="h-full">
                <Spotlight className="h-full">
                    <form onSubmit={handleSubmit} className="relative overflow-hidden rounded-[2.5rem] border border-border/10 dark:border-white/10 bg-gradient-to-br from-card to-muted/20 dark:from-black/40 dark:to-black/20 backdrop-blur-xl h-full flex flex-col group">
                        {/* Background Glow */}
                        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-purple-500/10 blur-[80px] pointer-events-none group-hover:bg-purple-500/20 transition-colors duration-500" />

                        <div className="p-8 space-y-8 relative z-10 flex-1">
                            <div>
                                <h2 className="text-2xl font-bold text-foreground dark:text-white mb-2">Personal Information</h2>
                                <p className="text-sm text-slate-400">Update your primary contact details and delivery address.</p>
                            </div>

                            <div className="grid gap-6">
                                {/* Full Name */}
                                <div className="space-y-3 group/input">
                                    <FloatingLabelInput
                                        id="name"
                                        name="name"
                                        label="Full Name"
                                        startIcon={<User className="h-4 w-4" />}
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="bg-muted/20 dark:bg-black/20 border-border/10 dark:border-white/10 focus:border-indigo-500/50 focus:bg-muted/30 dark:focus:bg-black/40 transition-all text-foreground dark:text-white"
                                    />
                                </div>

                                {/* Gender & DOB */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-3 group/input">
                                        <Label htmlFor="gender" className="text-sm font-semibold text-muted-foreground">Gender</Label>
                                        <select
                                            id="gender"
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleChange}
                                            className="w-full bg-muted/20 dark:bg-black/20 border border-border/10 dark:border-white/10 focus:border-indigo-500/50 rounded-xl h-12 px-3 text-foreground dark:text-white"
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="space-y-3 group/input">
                                        <Label htmlFor="dateOfBirth" className="text-sm font-semibold text-muted-foreground">Date of Birth</Label>
                                        <Input
                                            id="dateOfBirth"
                                            name="dateOfBirth"
                                            type="date"
                                            value={formData.dateOfBirth?.split('T')[0] || ''}
                                            onChange={handleChange}
                                            className="bg-muted/20 dark:bg-black/20 border-border/10 dark:border-white/10 focus:border-indigo-500/50 rounded-xl h-12 text-foreground dark:text-white"
                                        />
                                    </div>
                                </div>

                                {/* Address Section */}
                                <div className="space-y-4 pt-4 border-t border-border/10 dark:border-white/10">
                                    <h3 className="text-lg font-semibold text-foreground dark:text-white flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-indigo-400" />
                                        Address Details
                                    </h3>

                                    <div className="space-y-4">
                                        <FloatingLabelInput
                                            id="addressLine1"
                                            name="addressLine1"
                                            label="Address Line 1"
                                            value={formData.addressLine1}
                                            onChange={handleChange}
                                            className="bg-muted/20 dark:bg-black/20 border-border/10 dark:border-white/10 rounded-xl text-foreground dark:text-white"
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <FloatingLabelInput
                                            id="addressLine2"
                                            name="addressLine2"
                                            label="Address Line 2 (Optional)"
                                            value={formData.addressLine2}
                                            onChange={handleChange}
                                            className="bg-muted/20 dark:bg-black/20 border-border/10 dark:border-white/10 rounded-xl text-foreground dark:text-white"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        <div className="space-y-3">
                                            <FloatingLabelInput
                                                id="city"
                                                name="city"
                                                label="City"
                                                value={formData.city}
                                                onChange={handleChange}
                                                className="bg-muted/20 dark:bg-black/20 border-border/10 dark:border-white/10 rounded-xl text-foreground dark:text-white"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <FloatingLabelInput
                                                id="state"
                                                name="state"
                                                label="State"
                                                value={formData.state}
                                                onChange={handleChange}
                                                className="bg-muted/20 dark:bg-black/20 border-border/10 dark:border-white/10 rounded-xl text-foreground dark:text-white"
                                            />
                                        </div>
                                        <div className="col-span-2 md:col-span-1 space-y-3">
                                            <FloatingLabelInput
                                                id="pincode"
                                                name="pincode"
                                                label="Pincode"
                                                value={formData.pincode}
                                                onChange={handleChange}
                                                className="bg-muted/20 dark:bg-black/20 border-border/10 dark:border-white/10 rounded-xl text-foreground dark:text-white"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-auto border-t border-border/5 dark:border-white/5 bg-muted/20 dark:bg-black/20 p-6 flex justify-end">
                            <Button
                                type="submit"
                                loading={saving}
                                size="lg"
                                className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0 hover:shadow-lg hover:shadow-indigo-500/25 transition-all rounded-xl h-11 px-8 font-semibold"
                            >
                                <Save className="mr-2 h-5 w-5" />
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </Spotlight>
            </motion.div>
        </PremiumTilt>
    );
};
