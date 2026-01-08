"use client";

import { motion } from "framer-motion";
import { ReactNode, MouseEvent, useState } from "react";

interface RippleButtonProps {
    children: ReactNode;
    onClick?: () => void;
    className?: string;
    variant?: "primary" | "secondary" | "outline";
    size?: "sm" | "md" | "lg";
    disabled?: boolean;
}

export function RippleButton({
    children,
    onClick,
    className = "",
    variant = "primary",
    size = "md",
    disabled = false,
}: RippleButtonProps) {
    const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

    const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
        const button = e.currentTarget;
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const newRipple = { x, y, id: Date.now() };
        setRipples((prev) => [...prev, newRipple]);

        setTimeout(() => {
            setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
        }, 600);

        onClick?.();
    };

    const baseClasses = "relative overflow-hidden transition-all duration-300";

    const variantClasses = {
        primary: "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl",
        secondary: "bg-white/10 hover:bg-white/20 text-white border border-white/20",
        outline: "bg-transparent border-2 border-white/30 hover:border-white/50 text-white hover:bg-white/5",
    };

    const sizeClasses = {
        sm: "px-4 py-2 text-sm rounded-lg",
        md: "px-6 py-3 text-base rounded-xl",
        lg: "px-8 py-4 text-lg rounded-2xl",
    };

    return (
        <motion.button
            onClick={handleClick}
            disabled={disabled}
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className} ${disabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
            whileHover={{ scale: disabled ? 1 : 1.05 }}
            whileTap={{ scale: disabled ? 1 : 0.95 }}
        >
            {ripples.map((ripple) => (
                <motion.span
                    key={ripple.id}
                    className="absolute rounded-full bg-white/30"
                    initial={{
                        width: 0,
                        height: 0,
                        x: ripple.x,
                        y: ripple.y,
                        opacity: 1,
                    }}
                    animate={{
                        width: 500,
                        height: 500,
                        x: ripple.x - 250,
                        y: ripple.y - 250,
                        opacity: 0,
                    }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                />
            ))}
            <span className="relative z-10">{children}</span>
        </motion.button>
    );
}
