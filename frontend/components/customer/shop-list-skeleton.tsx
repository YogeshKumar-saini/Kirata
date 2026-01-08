import { Skeleton } from "@/components/ui/skeleton";

export function ShopListSkeleton() {
    return (
        <div className="space-y-8 p-1 sm:p-2">
            {/* Header Skeleton */}
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                    <Skeleton className="h-10 w-48 rounded-lg" />
                    <Skeleton className="h-4 w-64 mt-2 rounded-lg" />
                </div>
                <div className="flex gap-4">
                    <Skeleton className="h-10 w-full md:w-64 rounded-full" />
                    <Skeleton className="h-10 w-32 rounded-full" />
                </div>
            </div>

            {/* Grid Skeleton */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="flex flex-col h-full rounded-3xl overflow-hidden border border-muted bg-card/30">
                        {/* Image Skeleton */}
                        <Skeleton className="h-48 w-full" />

                        {/* Content Skeleton */}
                        <div className="p-5 space-y-4 flex-1 flex flex-col">
                            <div>
                                <Skeleton className="h-6 w-3/4 rounded-lg" />
                                <Skeleton className="h-4 w-1/2 mt-2 rounded-lg" />
                            </div>

                            <div className="mt-auto pt-4 border-t border-muted flex items-center justify-between">
                                <div className="space-y-1">
                                    <Skeleton className="h-3 w-16" />
                                    <Skeleton className="h-6 w-20" />
                                </div>
                                <Skeleton className="h-10 w-10 rounded-full" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
