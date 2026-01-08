"use client";

import React from "react";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface PageHeaderProps {
    title: string;
    description?: React.ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    actions?: React.ReactNode;
    showBackButton?: boolean;
    className?: string;
}

export function PageHeader({
    title,
    description,
    breadcrumbs = [],
    actions,
    showBackButton = false,
    className,
}: PageHeaderProps) {
    const router = useRouter();

    return (
        <div className={cn("flex flex-col gap-4 pb-6 md:pb-8", className)}>
            {/* Breadcrumbs */}
            {(breadcrumbs.length > 0 || showBackButton) && (
                <motion.nav
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center text-sm text-muted-foreground mb-2"
                >
                    {showBackButton && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 mr-2 -ml-2 rounded-full hover:bg-muted/50"
                            onClick={() => router.back()}
                            aria-label="Go back"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    )}

                    <div className="flex items-center flex-wrap">
                        {breadcrumbs.map((item, index) => (
                            <React.Fragment key={index}>
                                {index > 0 && (
                                    <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground/40" />
                                )}
                                {item.href ? (
                                    <Link
                                        href={item.href}
                                        className="hover:text-primary transition-colors hover:underline underline-offset-4"
                                    >
                                        {item.label}
                                    </Link>
                                ) : (
                                    <span className="text-foreground font-medium pointer-events-none">
                                        {item.label}
                                    </span>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </motion.nav>
            )}

            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                {/* Title & Description */}
                <div className="space-y-1.5 flex-1">
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="text-2xl md:text-3xl font-bold tracking-tight text-foreground"
                    >
                        {title}
                    </motion.h1>

                    {description && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.4, delay: 0.2 }}
                            className="text-base text-muted-foreground max-w-2xl leading-relaxed"
                        >
                            {description}
                        </motion.p>
                    )}
                </div>

                {/* Actions */}
                {actions && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        className="flex items-center gap-3 flex-wrap md:flex-nowrap"
                    >
                        {actions}
                    </motion.div>
                )}
            </div>

            <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="h-px w-full bg-gradient-to-r from-border via-border/50 to-transparent mt-2 origin-left"
            />
        </div>
    );
}
