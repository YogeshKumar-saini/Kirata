"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import api from "@/lib/api";
import { Plus, Trash2, Bell, MessageSquare } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface UserPreferences {
    notificationPrefs: {
        email: boolean;
        whatsapp: boolean;
        dailyReport: boolean;
    };
    reminderTemplates: string[];
}

export function PreferencesForm() {
    const [prefs, setPrefs] = useState<UserPreferences>({
        notificationPrefs: {
            email: true,
            whatsapp: true,
            dailyReport: true
        },
        reminderTemplates: [
            "Hello, a gentle reminder that your payment of ₹{amount} is pending. Please pay at your earliest convenience.",
            "Hi, your account balance is ₹{balance}. Kindly clear the dues."
        ]
    });
    const [loading, setLoading] = useState(true);
    const [newTemplate, setNewTemplate] = useState("");
    const { toast } = useToast();

    useEffect(() => {
        const fetchPrefs = async () => {
            try {
                const response = await api.get('/preferences');
                if (response.data.preferences) {
                    const data = response.data.preferences;
                    setPrefs({
                        notificationPrefs: {
                            email: data.notificationPrefs?.email ?? true,
                            whatsapp: data.notificationPrefs?.whatsapp ?? true,
                            dailyReport: data.notificationPrefs?.dailyReport ?? true,
                        },
                        reminderTemplates: Array.isArray(data.reminderTemplates) && data.reminderTemplates.length > 0
                            ? data.reminderTemplates
                            : [
                                "Hello, a gentle reminder that your payment of ₹{amount} is pending. Please pay at your earliest convenience.",
                                "Hi, your account balance is ₹{balance}. Kindly clear the dues."
                            ],
                    });
                }
            } catch (error) {
                console.error("Failed to load preferences:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPrefs();
    }, []);

    const savePreferences = async (newPrefs: UserPreferences) => {
        try {
            await api.patch('/preferences', newPrefs);
            setPrefs(newPrefs);
            toast({
                title: "Settings saved",
                description: "Your preferences have been updated.",
            });
        } catch (error) {
            console.error("Failed to save preferences:", error);
            toast({
                title: "Error",
                description: "Failed to save settings.",
                variant: "destructive",
            });
        }
    };

    const toggleNotification = (key: keyof UserPreferences['notificationPrefs']) => {
        const updated = {
            ...prefs,
            notificationPrefs: {
                ...prefs.notificationPrefs,
                [key]: !prefs.notificationPrefs[key]
            }
        };
        savePreferences(updated);
    };

    const addTemplate = () => {
        if (!newTemplate.trim()) return;
        const updated = {
            ...prefs,
            reminderTemplates: [...prefs.reminderTemplates, newTemplate.trim()]
        };
        savePreferences(updated);
        setNewTemplate("");
    };

    const removeTemplate = (index: number) => {
        const updated = {
            ...prefs,
            reminderTemplates: prefs.reminderTemplates.filter((_, i) => i !== index)
        };
        savePreferences(updated);
    };

    if (loading) return <div>Loading settings...</div>;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Notifications
                    </CardTitle>
                    <CardDescription>Manage how you receive alerts and reports.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Email Notifications</Label>
                            <div className="text-sm text-muted-foreground">Receive critical alerts via email</div>
                        </div>
                        <Switch
                            checked={prefs.notificationPrefs.email}
                            onCheckedChange={() => toggleNotification('email')}
                        />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>WhatsApp Notifications</Label>
                            <div className="text-sm text-muted-foreground">Receive updates on WhatsApp</div>
                        </div>
                        <Switch
                            checked={prefs.notificationPrefs.whatsapp}
                            onCheckedChange={() => toggleNotification('whatsapp')}
                        />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Daily Sales Report</Label>
                            <div className="text-sm text-muted-foreground">Receive a summary every night</div>
                        </div>
                        <Switch
                            checked={prefs.notificationPrefs.dailyReport}
                            onCheckedChange={() => toggleNotification('dailyReport')}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Reminder Templates
                    </CardTitle>
                    <CardDescription>Customize messages sent to customers for payment reminders.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Enter new template (use {amount} for dynamic value)"
                            value={newTemplate}
                            onChange={(e) => setNewTemplate(e.target.value)}
                        />
                        <Button onClick={addTemplate} disabled={!newTemplate.trim()}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="space-y-2 mt-4">
                        {prefs.reminderTemplates.map((template, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                                <p className="text-sm">{template}</p>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-muted-foreground hover:text-red-500"
                                    onClick={() => removeTemplate(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
