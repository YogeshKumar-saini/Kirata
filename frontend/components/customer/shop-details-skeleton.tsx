import { Skeleton } from "@/components/ui/skeleton";

export function ShopDetailsSkeleton() {
    return (
        <div className="space-y-6 pb-20 md:pb-6">
            {/* Header Skeleton */}
            <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-md" />
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-32" />
                </div>
                <div className="ml-auto hidden md:block">
                    <Skeleton className="h-10 w-40 rounded-md" />
                </div>
            </div>

            {/* Tabs Skeleton */}
            <div className="w-full">
                <Skeleton className="h-10 w-full mb-6 rounded-lg" />

                {/* Content Skeleton (Simulating Store Tab) */}
                <div className="space-y-6">
                    <Skeleton className="h-20 w-full rounded-lg" />

                    {/* Products Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="h-64 rounded-xl border border-muted bg-card/30 p-4 space-y-4">
                                <Skeleton className="h-32 w-full rounded-lg" />
                                <Skeleton className="h-4 w-3/4" />
                                <div className="flex justify-between items-center">
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-8 w-20 rounded-md" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
