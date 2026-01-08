'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from "@/context/auth-context";
import { ThemeProvider } from "@/context/theme-context";
import { DynamicBackground } from "@/components/ui/dynamic-background";
import { ShortcutsProvider } from "@/components/ui/shortcuts-provider";
import { GoogleOAuthProvider } from '@react-oauth/google';

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000, // 1 minute
            },
        },
    }));

    // Note: In a real app, use environment variable
    const clientId = "YOUR_GOOGLE_CLIENT_ID_PLACEHOLDER";

    return (
        <QueryClientProvider client={queryClient}>
            <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || clientId}>
                <ThemeProvider>
                    <AuthProvider>
                        <DynamicBackground />
                        <ShortcutsProvider />
                        {children}
                    </AuthProvider>
                </ThemeProvider>
            </GoogleOAuthProvider>
        </QueryClientProvider>
    );
}
