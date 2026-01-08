import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function AuthSkeleton() {
    return (
        <div className="flex min-h-screen bg-slate-950 text-foreground relative overflow-hidden">
            {/* Left Side: Hero Skeleton */}
            <div className="hidden lg:flex w-1/2 relative items-center justify-center p-12">
                <div className="relative z-10 max-w-lg space-y-8 w-full">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-16 w-16 rounded-2xl" />
                        <div>
                            <Skeleton className="h-10 w-32" />
                            <Skeleton className="h-4 w-40 mt-1" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Skeleton className="h-12 w-3/4" />
                        <Skeleton className="h-12 w-1/2" />
                        <Skeleton className="h-20 w-full" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                        <Skeleton className="h-24 rounded-xl" />
                        <Skeleton className="h-24 rounded-xl" />
                    </div>
                </div>
            </div>

            {/* Right Side: Form Skeleton */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12 relative">
                <div className="w-full max-w-md">
                    <Card className="border-0 shadow-2xl bg-slate-900/80 p-8">
                        <div className="flex justify-center mb-6 lg:hidden">
                            <Skeleton className="h-14 w-14 rounded-xl" />
                        </div>

                        <div className="text-center mb-8 space-y-2">
                            <Skeleton className="h-8 w-48 mx-auto" />
                            <Skeleton className="h-4 w-64 mx-auto" />
                        </div>

                        {/* Login Method Slider Skeleton */}
                        <Skeleton className="h-12 w-full rounded-xl mb-6" />

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-12 w-full" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-12 w-full" />
                            </div>

                            <Skeleton className="h-12 w-full mt-6" />
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
