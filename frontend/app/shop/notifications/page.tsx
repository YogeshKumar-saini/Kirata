'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { History, Send } from "lucide-react";
import SendReminder from "../../../components/shop/notifications/send-reminder";
import NotificationHistory from "../../../components/shop/notifications/notification-history";

export default function NotificationsPage() {
    return (
        <div className="flex flex-col gap-6 p-1 pb-20">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60 dark:from-white dark:to-white/60">
                    Notifications
                </h1>
                <p className="text-muted-foreground text-lg">
                    Manage logic and communication with your customers.
                </p>
            </div>

            <Tabs defaultValue="send" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                    <TabsTrigger value="send" className="flex items-center gap-2">
                        <Send className="h-4 w-4" />
                        Send Reminder
                    </TabsTrigger>
                    <TabsTrigger value="history" className="flex items-center gap-2">
                        <History className="h-4 w-4" />
                        History
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="send" className="space-y-4">
                    <SendReminder />
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                    <NotificationHistory />
                </TabsContent>
            </Tabs>
        </div>
    );
}