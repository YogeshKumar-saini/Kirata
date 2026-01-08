'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Package,
    Users,
    ShoppingCart,
    Star,
    Settings,
    LogOut,
    Store,
    DollarSign,
    Tag,
    PieChart,
    ChevronRight,
    ChevronLeft,
    Truck,
    Database,
    Bell,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useState } from 'react';

interface SidebarProps {
    className?: string;
    onClose?: () => void; // For mobile drawer
    isCollapsed?: boolean;
    toggleCollapse?: () => void;
}

const sidebarItems = [
    { title: 'Dashboard', href: '/shop', icon: LayoutDashboard },
    { title: 'Products', href: '/shop/products', icon: Package },
    { title: 'Suppliers', href: '/shop/suppliers', icon: Truck },
    { title: 'Offers', href: '/shop/offers', icon: Tag },
    { title: 'Orders', href: '/shop/orders', icon: ShoppingCart },
    { title: 'Customers', href: '/shop/customers', icon: Users },
    { title: 'Notifications', href: '/shop/notifications', icon: Bell },
    { title: 'Sales History', href: '/shop/ledger', icon: DollarSign },
    { title: 'Reviews', href: '/shop/reviews', icon: Star },
    { title: 'Analytics', href: '/shop/analytics', icon: PieChart },
    { title: 'Backup', href: '/shop/backup', icon: Database },
    { title: 'Settings', href: '/shop/settings', icon: Settings },
];

export function ShopSidebar({ className, onClose, isCollapsed = false, toggleCollapse }: SidebarProps) {
    const pathname = usePathname();
    const { logout, user } = useAuth();
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);

    return (
        <motion.div
            animate={{ width: isCollapsed ? 80 : 288 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={cn(
                'flex h-full flex-col border-r border-sidebar-border bg-sidebar backdrop-blur-3xl text-sidebar-foreground shadow-2xl overflow-hidden relative z-40',
                className
            )}
        >
            {/* Desktop Collapse Toggle */}
            {toggleCollapse && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleCollapse}
                    className="absolute -right-3 top-24 z-50 h-6 w-6 rounded-full border border-sidebar-border bg-sidebar text-muted-foreground shadow-sm hover:bg-sidebar-accent hover:text-sidebar-foreground hidden md:flex items-center justify-center translate-x-1 transition-all hover:scale-110"
                >
                    {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
                </Button>
            )}

            {/* Header */}
            <div className={cn("relative flex items-center border-b border-sidebar-border/50 bg-sidebar-accent/50 transition-all duration-300", isCollapsed ? "h-24 justify-center px-0" : "h-24 px-6 justify-between")}>
                {/* Decorative background glow - only in expanded */}
                {!isCollapsed && (
                    <div className="absolute top-0 left-0 w-32 h-32 bg-primary/20 blur-[60px] rounded-full pointer-events-none -translate-x-10 -translate-y-10" />
                )}

                <div className={cn("relative flex items-center gap-4 group", isCollapsed ? "justify-center w-full" : "")}>
                    <div className={cn(
                        "relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-purple-600 to-indigo-800 text-white shadow-lg shadow-primary/30 transition-all duration-500",
                        isCollapsed ? "h-12 w-12" : "h-12 w-12 group-hover:scale-105"
                    )}>
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Store className={cn("transition-all relative z-10", isCollapsed ? "h-6 w-6" : "h-6 w-6")} />
                    </div>

                    <AnimatePresence>
                        {!isCollapsed && (
                            <motion.div
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                                className="overflow-hidden whitespace-nowrap"
                            >
                                <div className="font-bold text-xl leading-none tracking-tight bg-gradient-to-r from-indigo-200 via-purple-200 to-white bg-clip-text text-transparent drop-shadow-sm">Kirata</div>
                                <div className="text-[10px] text-primary/80 mt-1.5 font-bold tracking-[0.2em] uppercase">Shop Manager</div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Theme Toggle in Header (Expanded only) */}
                {!isCollapsed && (
                    <div className="relative z-20 scale-90">
                        <ThemeToggle />
                    </div>
                )}
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-8 px-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {!isCollapsed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="mb-4 px-4 text-[10px] font-bold text-muted-foreground/70 uppercase tracking-[0.2em]"
                    >
                        Main Menu
                    </motion.div>
                )}
                <nav className="space-y-2">
                    {sidebarItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <div key={item.href} className="relative group/item"
                                onMouseEnter={() => isCollapsed && setHoveredItem(item.title)}
                                onMouseLeave={() => setHoveredItem(null)}
                            >
                                <Link
                                    href={item.href}
                                    onClick={onClose}
                                    className={cn(
                                        'relative flex items-center rounded-xl font-medium transition-all duration-300 ease-out overflow-hidden border border-transparent',
                                        isCollapsed ? "justify-center px-0 py-3 mx-1" : "gap-3 px-4 py-3",
                                        isActive
                                            ? 'text-sidebar-foreground border-sidebar-border/50 bg-sidebar-accent shadow-[0_0_20px_rgba(99,102,241,0.15)]'
                                            : 'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent hover:border-sidebar-border/50'
                                    )}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="shopActiveNavBackground"
                                            className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                        />
                                    )}

                                    {/* Active Indicator Bar - Premium Pill */}
                                    {isActive && (
                                        <motion.div
                                            layoutId="shopActiveNavBar"
                                            className={cn("absolute bg-gradient-to-b from-indigo-400 to-purple-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]", isCollapsed ? "left-1 top-1/2 -translate-y-1/2 h-1.5 w-1 rounded-full" : "left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full")}
                                            initial={{ height: 0 }}
                                            animate={{ height: isCollapsed ? 6 : 24 }}
                                            transition={{ duration: 0.2 }}
                                        />
                                    )}

                                    <item.icon className={cn(
                                        "relative z-10 transition-transform duration-300 group-hover/item:scale-110",
                                        isActive ? "text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" : "text-muted-foreground group-hover:text-sidebar-foreground",
                                        isCollapsed ? "h-6 w-6" : "h-5 w-5"
                                    )} />

                                    {!isCollapsed && (
                                        <motion.span
                                            initial={{ opacity: 0, width: 0 }}
                                            animate={{ opacity: 1, width: 'auto' }}
                                            exit={{ opacity: 0, width: 0 }}
                                            className="relative z-10 flex-1 whitespace-nowrap overflow-hidden"
                                        >
                                            {item.title}
                                        </motion.span>
                                    )}
                                </Link>

                                {/* Custom Tooltip for Collapsed State */}
                                {isCollapsed && hoveredItem === item.title && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, x: 0, scale: 1 }}
                                        exit={{ opacity: 0, x: 10, scale: 0.95 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute left-[110%] top-1/2 -translate-y-1/2 z-50 px-3 py-1.5 rounded-lg bg-popover border border-border text-xs font-semibold text-popover-foreground shadow-xl whitespace-nowrap backdrop-blur-md"
                                    >
                                        <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-popover border-l border-b border-border rotate-45" />
                                        {item.title}
                                    </motion.div>
                                )}
                            </div>
                        );
                    })}
                </nav>
            </div>

            {/* User / Footer */}
            <div className={cn("border-t border-sidebar-border/50 bg-sidebar-accent/30 backdrop-blur-sm transition-all relative z-20", isCollapsed ? "p-2" : "p-4")}>
                <div className={cn(
                    "group relative overflow-hidden rounded-2xl bg-gradient-to-br from-sidebar-accent/50 to-sidebar-accent/0 border border-sidebar-border/50 transition-all hover:border-indigo-500/30 hover:bg-sidebar-accent",
                    isCollapsed ? "p-2 flex flex-col items-center gap-2" : "p-4"
                )}>
                    {/* Glow effect on hover */}
                    <div className="absolute inset-0 bg-indigo-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className={cn("flex items-center relative z-10", isCollapsed ? "justify-center" : "mb-3 gap-3")}>
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20 ring-2 ring-white/10 group-hover:ring-indigo-500/40 transition-all shrink-0">
                            {user?.name?.[0] || 'S'}
                        </div>
                        {!isCollapsed && (
                            <div className="flex-1 overflow-hidden">
                                <p className="truncate text-sm font-semibold text-sidebar-foreground group-hover:text-indigo-300 transition-colors">{user?.name || 'Shopkeeper'}</p>
                                <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                            </div>
                        )}
                    </div>

                    {isCollapsed ? (
                        <div className="flex flex-col gap-2 relative z-10">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors rounded-lg"
                                onClick={logout}
                                title="Sign Out"
                            >
                                <LogOut className="h-4 w-4" />
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-2 relative z-10">
                            <Button
                                variant="ghost"
                                className="w-full justify-start gap-2 h-9 text-xs font-semibold text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors rounded-lg group/logout"
                                onClick={logout}
                            >
                                <LogOut className="h-3.5 w-3.5 group-hover/logout:-translate-x-1 transition-transform" />
                                Sign Out
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
