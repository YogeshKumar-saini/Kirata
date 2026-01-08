"use client";

import { ShopSidebar } from '@/components/shop/sidebar';
import { useAuth } from '@/context/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export default function ShopLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

    // Close mobile menu when route changes
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsMobileMenuOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (!loading) {
            if (user && user.role === 'SHOPKEEPER' && !user.hasCompletedShopSetup && pathname !== '/shop/setup') {
                router.push('/shop/setup');
            }
        }
    }, [user, loading, pathname, router]);


    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // On Setup page, don't show sidebar
    if (pathname === '/shop/setup') {
        return <>{children}</>;
    }

    return (
        <div className="flex min-h-screen bg-background relative">

            {/* Desktop Sidebar - Hidden on mobile, fixed width */}
            <div className="hidden md:block sticky top-0 h-screen z-30">
                <ShopSidebar
                    className="h-full"
                    isCollapsed={isDesktopCollapsed}
                    toggleCollapse={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
                />
            </div>

            {/* Mobile Header & Content Wrapper */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* Mobile Header */}
                <div className="md:hidden flex items-center justify-between p-4 border-b border-border/40 bg-background/80 backdrop-blur-xl sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold">
                            <span className="text-sm">K</span>
                        </div>
                        <span className="font-bold text-lg">Kirata</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
                        <Menu className="h-6 w-6" />
                    </Button>
                </div>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto w-full">
                    <div className="container mx-auto p-4 md:p-8 max-w-7xl animate-fade-in">
                        {children}
                    </div>
                </main>
            </div>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
                        />
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                            className="fixed inset-y-0 left-0 z-50 w-72 md:hidden"
                        >
                            <ShopSidebar onClose={() => setIsMobileMenuOpen(false)} className="h-full w-full rounded-r-2xl border-r-0" />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
