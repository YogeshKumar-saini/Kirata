"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    actionLabel,
    onAction,
    className,
}: EmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className={cn(
                "flex flex-col items-center justify-center text-center p-8 md:p-12 rounded-[2rem] border border-dashed border-border/50 bg-muted/5",
                className
            )}
        >
            <div className="relative mb-6 group">
                {/* Background glow */}
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative h-20 w-20 rounded-3xl bg-gradient-to-br from-muted to-background border border-border shadow-inner flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <Icon className="h-10 w-10 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                </div>
            </div>

            <h3 className="text-xl font-bold tracking-tight mb-2 text-foreground">
                {title}
            </h3>

            <p className="text-muted-foreground max-w-sm mb-8 leading-relaxed">
                {description}
            </p>

            {actionLabel && onAction && (
                <Button
                    onClick={onAction}
                    size="lg"
                    className="rounded-full font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:scale-105"
                >
                    {actionLabel}
                </Button>
            )}
        </motion.div>
    );
}
