'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Clock } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { shopService, Shop } from "@/services/shop-service";

interface BusinessHoursSettingsProps {
    shop: Shop;
    onUpdate: (updatedShop: Shop) => void;
}

type DaySchedule = { open: string; close: string; closed: boolean };
type WeeklySchedule = Record<string, DaySchedule>;

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const DEFAULT_SCHEDULE: DaySchedule = { open: '09:00', close: '20:00', closed: false };

export function BusinessHoursSettings({ shop, onUpdate }: BusinessHoursSettingsProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    // Initialize schedule from shop data or defaults
    const [schedule, setSchedule] = useState<WeeklySchedule>(() => {
        if (shop.businessHours && Object.keys(shop.businessHours).length > 0) {
            return shop.businessHours as WeeklySchedule;
        }
        // Build default
        const defaults: WeeklySchedule = {};
        DAYS.forEach(day => { defaults[day] = { ...DEFAULT_SCHEDULE }; });
        return defaults;
    });

    const handleToggleClosed = (day: string, closed: boolean) => {
        setSchedule(prev => ({
            ...prev,
            [day]: { ...prev[day], closed }
        }));
    };

    const handleTimeChange = (day: string, field: 'open' | 'close', value: string) => {
        setSchedule(prev => ({
            ...prev,
            [day]: { ...prev[day], [field]: value }
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await shopService.updateBusinessHours(schedule);
            onUpdate({ ...shop, businessHours: schedule });
            toast({ title: "Schedule Updated", description: "Business hours have been saved." });
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to save schedule.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-border/40 dark:border-white/5 bg-card/40 backdrop-blur-xl">
            <CardHeader>
                <CardTitle>Business Hours</CardTitle>
                <CardDescription>Set your weekly opening and closing times.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid gap-4">
                    {DAYS.map(day => (
                        <div key={day} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-muted/20 dark:bg-white/5 border border-border/10 gap-4">
                            <div className="flex items-center gap-3 w-32">
                                <Switch
                                    checked={!schedule[day]?.closed}
                                    onCheckedChange={(checked) => handleToggleClosed(day, !checked)}
                                />
                                <span className="capitalize font-medium">{day}</span>
                            </div>

                            {!schedule[day]?.closed ? (
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="time"
                                            value={schedule[day]?.open}
                                            onChange={(e) => handleTimeChange(day, 'open', e.target.value)}
                                            className="w-28 h-8 bg-background border-border/20"
                                        />
                                    </div>
                                    <span className="text-muted-foreground">-</span>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="time"
                                            value={schedule[day]?.close}
                                            onChange={(e) => handleTimeChange(day, 'close', e.target.value)}
                                            className="w-28 h-8 bg-background border-border/20"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 text-center sm:text-left sm:pl-4 text-muted-foreground text-sm italic">
                                    Closed
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex justify-end pt-4">
                    <Button onClick={handleSave} disabled={loading} className="bg-primary hover:bg-primary/90">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Schedule
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
