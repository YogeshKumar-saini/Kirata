"use client";

import React, { useEffect, useState } from "react";

export function CustomCursor() {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isPointer, setIsPointer] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setPosition({ x: e.clientX, y: e.clientY });
            setIsVisible(true);

            const target = e.target as HTMLElement;
            setIsPointer(
                window.getComputedStyle(target).cursor === "pointer" ||
                target.tagName === "BUTTON" ||
                target.tagName === "A"
            );
        };

        const handleMouseLeave = () => {
            setIsVisible(false);
        };

        window.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, []);

    // Only show on desktop
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
        return null;
    }

    return (
        <>
            {/* Main cursor */}
            <div
                className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference transition-transform duration-100"
                style={{
                    transform: `translate(${position.x}px, ${position.y}px)`,
                    opacity: isVisible ? 1 : 0,
                }}
            >
                <div
                    className={`w-8 h-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white transition-all duration-200 ${isPointer ? "scale-150" : "scale-100"
                        }`}
                />
            </div>

            {/* Trail dot */}
            <div
                className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference transition-all duration-300 ease-out"
                style={{
                    transform: `translate(${position.x}px, ${position.y}px)`,
                    opacity: isVisible ? 0.5 : 0,
                }}
            >
                <div className="w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
            </div>
        </>
    );
}
