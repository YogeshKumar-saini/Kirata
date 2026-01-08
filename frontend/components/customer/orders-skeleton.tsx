import { Skeleton } from "@/components/ui/skeleton";

export function OrdersSkeleton() {
    return (
        <div className="space-y-8 p-1 sm:p-2">
            {/* Header Skeleton */}
            <div className="flex flex-col gap-6">
                <div>
                    <Skeleton className="h-10 w-48 rounded-lg" />
                    <Skeleton className="h-4 w-64 mt-2 rounded-lg" />
                </div>
                <Skeleton className="h-10 w-full max-w-md rounded-lg" />
            </div>

            {/* Tabs Skeleton */}
            <div className="w-full max-w-md">
                <Skeleton className="h-12 w-full rounded-2xl" />
            </div>

            {/* Orders Grid Skeleton */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 mt-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="relative overflow-hidden rounded-3xl border border-muted bg-card/30 p-6">
                        {/* Status Badge Skeleton */}
                        <div className="absolute top-6 right-6">
                            <Skeleton className="h-6 w-20 rounded-full" />
                        </div>

                        {/* Order Header */}
                        <div className="flex items-start gap-3 mb-4 pr-24">
                            <Skeleton className="h-12 w-12 rounded-2xl" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-5 w-32" />
                                <Skeleton className="h-3 w-40" />
                            </div>
                        </div>

                        {/* Items Preview */}
                        <Skeleton className="h-12 w-full rounded-xl mb-4" />

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-4 border-t border-muted">
                            <div className="space-y-1">
                                <Skeleton className="h-3 w-16" />
                                <Skeleton className="h-6 w-24" />
                            </div>
                            <Skeleton className="h-8 w-24 rounded-full" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
