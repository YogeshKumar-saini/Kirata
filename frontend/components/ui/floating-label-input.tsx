import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface FloatingLabelInputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
    containerClassName?: string;
}

const FloatingLabelInput = React.forwardRef<HTMLInputElement, FloatingLabelInputProps>(
    ({ className, containerClassName, label, id, startIcon, endIcon, ...props }, ref) => {
        const generatedId = React.useId();
        const inputId = id || generatedId;

        return (
            <div className={cn("relative group", containerClassName)}>
                {startIcon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10 transition-colors group-focus-within:text-primary pointer-events-none">
                        {startIcon}
                    </div>
                )}

                <Input
                    ref={ref}
                    id={inputId}
                    className={cn(
                        "peer block w-full rounded-xl border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-all duration-200",
                        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
                        "placeholder:text-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary",
                        "h-14 pt-5 pb-2", // Custom height and padding for floating label layout
                        startIcon ? "pl-11" : "",
                        endIcon ? "pr-11" : "",
                        className
                    )}
                    placeholder=" " // Required for :placeholder-shown to trigger
                    {...props}
                />

                <Label
                    htmlFor={inputId}
                    className={cn(
                        "absolute text-muted-foreground transition-all duration-200 pointer-events-none origin-[0] leading-tight",
                        // Floating state (active/filled)
                        "peer-focus:top-2.5 peer-focus:scale-85 peer-focus:text-primary",
                        "peer-[:not(:placeholder-shown)]:top-2.5 peer-[:not(:placeholder-shown)]:scale-85",
                        // Default state (placeholder)
                        "peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100",
                        startIcon ? "left-11" : "left-3"
                    )}
                >
                    {label}
                </Label>

                {endIcon && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10 transition-colors group-focus-within:text-foreground">
                        {endIcon}
                    </div>
                )}
            </div>
        );
    }
);
FloatingLabelInput.displayName = "FloatingLabelInput";

export { FloatingLabelInput };
