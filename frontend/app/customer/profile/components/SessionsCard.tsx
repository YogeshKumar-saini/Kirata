import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Shield, Loader2, Smartphone, Monitor, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PremiumTilt } from '@/components/ui/PremiumTilt';
import { Spotlight } from '@/components/ui/Spotlight';

interface Session {
    id: string;
    deviceInfo?: string;
    ipAddress?: string;
    lastActive: string;
    isCurrent?: boolean;
}

interface SessionsCardProps {
    sessions: Session[];
    loading: boolean;
    onRevoke: (id: string) => void;
    onRevokeAll: () => void;
    variants: Variants;
}

export const SessionsCard = ({ sessions, loading, onRevoke, onRevokeAll, variants }: SessionsCardProps) => {
    return (
        <PremiumTilt className="lg:col-span-3">
            <motion.div variants={variants}>
                <Spotlight>
                    <div className="relative overflow-hidden rounded-[2.5rem] border border-border/10 dark:border-white/10 bg-gradient-to-br from-card to-muted/20 dark:from-black/40 dark:to-black/20 backdrop-blur-xl p-8 group">
                        <div className="space-y-6 relative z-10">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-border/5 dark:border-white/5 pb-6 gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 shadow-inner border border-purple-500/20">
                                        <Shield className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-foreground dark:text-white">Active Sessions</h2>
                                        <p className="text-sm text-slate-400">Manage devices logged into your account</p>
                                    </div>
                                </div>
                                {sessions.length > 1 && (
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={onRevokeAll}
                                        className="rounded-xl px-4 h-9 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
                                    >
                                        <LogOut className="h-4 w-4 mr-2" />
                                        Revoke All
                                    </Button>
                                )}
                            </div>

                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
                                </div>
                            ) : sessions.length === 0 ? (
                                <p className="text-slate-500 text-center py-12 italic">No active sessions found.</p>
                            ) : (
                                <div className="grid gap-4 md:grid-cols-2">
                                    {sessions.map((session) => (
                                        <div key={session.id} className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 dark:bg-black/20 border border-border/5 dark:border-white/5 hover:border-indigo-500/30 hover:bg-muted/30 dark:hover:bg-black/30 transition-all group/session">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-muted to-muted/50 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center border border-border/10 dark:border-white/10 transition-transform">
                                                    {session.deviceInfo?.toLowerCase().includes('mobile') ? (
                                                        <Smartphone className="h-6 w-6 text-purple-400" />
                                                    ) : (
                                                        <Monitor className="h-6 w-6 text-blue-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-foreground dark:text-white">{session.deviceInfo || 'Unknown Device'}</p>
                                                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                                                        <span className={`w-1.5 h-1.5 rounded-full ${session.isCurrent ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
                                                        {session.ipAddress}
                                                    </p>
                                                    <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wide">
                                                        Active: {new Date(session.lastActive).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {session.isCurrent && (
                                                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20 px-3 py-1">Current</Badge>
                                                )}
                                                {!session.isCurrent && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => onRevoke(session.id)}
                                                        className="h-8 w-8 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
                                                    >
                                                        <LogOut className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </Spotlight>
            </motion.div>
        </PremiumTilt>
    );
};
