'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { Loader2, RefreshCw } from "lucide-react";

interface Notification {
    id: string;
    type: string;
    channel: string;
    status: string;
    message: string;
    sentAt: string | null;
    customer: {
        name: string | null;
        phone: string | null;
    } | null;
}

export default function NotificationHistory() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);
    const LIMIT = 10;

    const fetchHistory = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(`/notifications/history?limit=${LIMIT}&offset=${page * LIMIT}`);
            setNotifications(res.data.notifications);
            setTotal(res.data.total);
        } catch (error) {
            console.error("Failed to fetch history:", error);
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'SENT':
                return <Badge className="bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25 border-emerald-500/20">Sent</Badge>;
            case 'FAILED':
                return <Badge variant="destructive" className="bg-red-500/15 text-red-500 hover:bg-red-500/25 border-red-500/20">Failed</Badge>;
            default:
                return <Badge variant="secondary">Pending</Badge>;
        }
    };

    return (
        <Card className="glass border-border/40 dark:border-white/5">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Notification History</CardTitle>
                    <CardDescription>View past notifications sent to customers ({total})</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={() => fetchHistory()} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border border-white/5 overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow className="hover:bg-transparent border-white/5">
                                <TableHead>Date</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Channel</TableHead>
                                <TableHead>Message</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading && notifications.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                    </TableCell>
                                </TableRow>
                            ) : notifications.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                        No notifications found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                notifications.map((notification) => (
                                    <TableRow key={notification.id} className="border-white/5 hover:bg-white/5">
                                        <TableCell className="font-medium text-muted-foreground text-xs whitespace-nowrap">
                                            {notification.sentAt ? format(new Date(notification.sentAt), 'PP p') : '-'}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{notification.customer?.name || 'Unknown'}</span>
                                                <span className="text-xs text-muted-foreground">{notification.customer?.phone || '-'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="text-xs border-white/10">
                                                {notification.channel}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="max-w-[300px]">
                                            <p className="truncate text-sm text-muted-foreground" title={notification.message}>
                                                {notification.message}
                                            </p>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(notification.status)}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-end space-x-2 py-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0 || loading}
                        className="glass border-white/10"
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => p + 1)}
                        disabled={(page + 1) * LIMIT >= total || loading}
                        className="glass border-white/10"
                    >
                        Next
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
