"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function ShortcutsProvider() {
    const router = useRouter();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if user is typing in an input
            if (
                document.activeElement?.tagName === "INPUT" ||
                document.activeElement?.tagName === "TEXTAREA"
            ) {
                return;
            }

            // Cmd+K or Ctrl+K -> Focus Search
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
                if (searchInput) {
                    searchInput.focus();
                }
            }

            // Cmd+B or Ctrl+B -> New Bill (Record Sale)
            // This is trickier as it depends on where the modal trigger is. 
            // We'll dispatch a custom event that pages can listen to, OR 
            // simply simulate a click on the "Record Sale" button if present.
            if ((e.metaKey || e.ctrlKey) && e.key === "b") {
                e.preventDefault();
                // Look for the "Record Sale" button ID we will add
                const recordSaleBtn = document.getElementById("record-sale-btn");
                if (recordSaleBtn) {
                    recordSaleBtn.click();
                } else {
                    // Fallback: Navigate to ledger if not there? No, let's just ignore for now.
                    // Or maybe we want to globally open it? For now, button click simulation is safest context-wise.
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [router]);

    return null;
}
