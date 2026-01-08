"use client";

import { CustomerSidebar } from '@/components/customer/sidebar';
import { useAuth } from '@/context/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export default function CustomerLayout({
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
            if (!user) {
                router.push('/login');
            } else if (user.role !== 'CUSTOMER') {
                if (user.role === 'SHOPKEEPER') {
                    router.push('/shop');
                }
            }
        }
    }, [user, loading, router]);


    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) return null; // Will redirect

    return (
        <div className="flex h-screen bg-background relative overflow-hidden">

            {/* Ambient Background Effects - Dark mode only */}
            <div className="fixed inset-0 pointer-events-none dark:block hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-purple-900/10 blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-indigo-900/10 blur-[120px]" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
            </div>


            {/* Desktop Sidebar - Hidden on mobile, scrollable independently */}
            <div className="hidden md:block h-screen z-30">
                <CustomerSidebar
                    className="h-full border-r border-border/40 bg-card/60 backdrop-blur-2xl"
                    isCollapsed={isDesktopCollapsed}
                    toggleCollapse={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
                />
            </div>

            {/* Mobile Header & Content Wrapper */}
            <div className="flex-1 flex flex-col min-w-0 relative z-10 h-screen overflow-hidden">

                {/* Mobile Header */}
                <div className="md:hidden flex items-center justify-between p-4 border-b border-border/40 bg-background/80 backdrop-blur-xl z-20 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
                            <span className="text-lg">K</span>
                        </div>
                        <span className="font-bold text-lg text-foreground">Kirata</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
                        <Menu className="h-6 w-6" />
                    </Button>
                </div>

                {/* Main Content Area - Scrollable independently */}
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
                            <CustomerSidebar onClose={() => setIsMobileMenuOpen(false)} className="h-full w-full rounded-r-2xl border-r border-border/40 bg-card/90 backdrop-blur-2xl" />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
