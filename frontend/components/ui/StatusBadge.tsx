"use client";

import React from "react";
import { cn } from "@/lib/utils";

export type StatusType = "success" | "warning" | "error" | "info" | "neutral" | "pending" | "paid" | "unpaid" | "completed" | "failed";

interface StatusBadgeProps {
    status: StatusType | string;
    label?: string;
    className?: string;
    size?: "sm" | "md";
    pulsing?: boolean;
}

const statusConfig: Record<string, { bg: string; text: string; dot: string; border: string }> = {
    // Success / Completed / Paid
    success: { bg: "bg-emerald-500/10", text: "text-emerald-500", dot: "bg-emerald-500", border: "border-emerald-500/20" },
    completed: { bg: "bg-emerald-500/10", text: "text-emerald-500", dot: "bg-emerald-500", border: "border-emerald-500/20" },
    paid: { bg: "bg-emerald-500/10", text: "text-emerald-500", dot: "bg-emerald-500", border: "border-emerald-500/20" },

    // Warning / Pending
    warning: { bg: "bg-amber-500/10", text: "text-amber-500", dot: "bg-amber-500", border: "border-amber-500/20" },
    pending: { bg: "bg-amber-500/10", text: "text-amber-500", dot: "bg-amber-500", border: "border-amber-500/20" },

    // Error / Failed / Unpaid
    error: { bg: "bg-red-500/10", text: "text-red-500", dot: "bg-red-500", border: "border-red-500/20" },
    failed: { bg: "bg-red-500/10", text: "text-red-500", dot: "bg-red-500", border: "border-red-500/20" },
    unpaid: { bg: "bg-red-500/10", text: "text-red-500", dot: "bg-red-500", border: "border-red-500/20" },

    // Info
    info: { bg: "bg-blue-500/10", text: "text-blue-500", dot: "bg-blue-500", border: "border-blue-500/20" },

    // Neutral / Default
    neutral: { bg: "bg-slate-500/10", text: "text-slate-500", dot: "bg-slate-500", border: "border-slate-500/20" },
    default: { bg: "bg-slate-500/10", text: "text-slate-500", dot: "bg-slate-500", border: "border-slate-500/20" },
};

export function StatusBadge({
    status,
    label,
    className,
    size = "sm",
    pulsing = false,
}: StatusBadgeProps) {
    const normalizedStatus = status.toLowerCase();
    const config = statusConfig[normalizedStatus] || statusConfig.default;

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 rounded-full font-medium border transition-colors",
                config.bg,
                config.text,
                config.border,
                size === "sm" ? "px-2 py-0.5 text-[10px] sm:text-xs" : "px-3 py-1 text-xs sm:text-sm",
                className
            )}
        >
            <span className="relative flex h-2 w-2">
                {(pulsing || normalizedStatus === "pending" || normalizedStatus === "live") && (
                    <span className={cn(
                        "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                        config.dot
                    )} />
                )}
                <span className={cn(
                    "relative inline-flex rounded-full h-2 w-2",
                    config.dot
                )} />
            </span>
            <span className="capitalize">{label || status}</span>
        </span>
    );
}
