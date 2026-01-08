"use client";

import { useState, useEffect } from "react";

interface TypewriterTextProps {
    texts: string[];
    typingSpeed?: number;
    deletingSpeed?: number;
    pauseDuration?: number;
    className?: string;
    cursorClassName?: string;
}

export function TypewriterText({
    texts,
    typingSpeed = 100,
    deletingSpeed = 50,
    pauseDuration = 2000,
    className = "",
    cursorClassName = "",
}: TypewriterTextProps) {
    const [currentTextIndex, setCurrentTextIndex] = useState(0);
    const [currentText, setCurrentText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [showCursor, setShowCursor] = useState(true);

    useEffect(() => {
        const targetText = texts[currentTextIndex];

        const timeout = setTimeout(
            () => {
                if (!isDeleting) {
                    // Typing
                    if (currentText.length < targetText.length) {
                        setCurrentText(targetText.slice(0, currentText.length + 1));
                    } else {
                        // Finished typing, pause then start deleting
                        setTimeout(() => setIsDeleting(true), pauseDuration);
                    }
                } else {
                    // Deleting
                    if (currentText.length > 0) {
                        setCurrentText(currentText.slice(0, -1));
                    } else {
                        // Finished deleting, move to next text
                        setIsDeleting(false);
                        setCurrentTextIndex((prev) => (prev + 1) % texts.length);
                    }
                }
            },
            isDeleting ? deletingSpeed : typingSpeed
        );

        return () => clearTimeout(timeout);
    }, [currentText, isDeleting, currentTextIndex, texts, typingSpeed, deletingSpeed, pauseDuration]);

    // Cursor blink effect
    useEffect(() => {
        const interval = setInterval(() => {
            setShowCursor((prev) => !prev);
        }, 530);
        return () => clearInterval(interval);
    }, []);

    return (
        <span className={className}>
            {currentText}
            <span
                className={`inline-block w-0.5 h-[0.9em] ml-1 bg-current ${showCursor ? "opacity-100" : "opacity-0"
                    } transition-opacity ${cursorClassName}`}
            />
        </span>
    );
}
