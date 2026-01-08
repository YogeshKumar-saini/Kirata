import { Skeleton } from "@/components/ui/skeleton";

export function OrderDetailsSkeleton() {
    return (
        <div className="space-y-6 max-w-3xl mx-auto pb-20 px-4 sm:px-6">
            {/* Header Skeleton */}
            <div className="flex items-center gap-2 pt-6">
                <Skeleton className="h-10 w-10 rounded-md" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-32" />
                </div>
                <div className="hidden sm:block">
                    <Skeleton className="h-8 w-24 rounded-full" />
                </div>
            </div>

            {/* Status Section Skeleton */}
            <div className="rounded-xl border border-muted bg-card overflow-hidden">
                <div className="bg-muted p-4">
                    <Skeleton className="h-4 w-32" />
                </div>
                <div className="p-8 space-y-8">
                    <Skeleton className="h-12 w-full rounded-full" />
                    <Skeleton className="h-12 w-3/4 mx-auto rounded-md" />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Shop Information Skeleton */}
                <div className="rounded-xl border border-muted bg-card p-6 space-y-4">
                    <Skeleton className="h-6 w-32" />
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                    </div>
                </div>

                {/* Order Summary Skeleton */}
                <div className="rounded-xl border border-muted bg-card p-6 space-y-4">
                    <Skeleton className="h-6 w-40" />
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                        <div className="flex justify-between">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-16" />
                        </div>
                        <Skeleton className="h-px w-full" />
                        <div className="flex justify-between">
                            <Skeleton className="h-6 w-16" />
                            <Skeleton className="h-6 w-24" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Items List Skeleton */}
            <div className="rounded-xl border border-muted bg-card overflow-hidden">
                <div className="p-6 border-b border-muted">
                    <Skeleton className="h-6 w-32" />
                </div>
                <div className="p-0 divide-y divide-muted">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-8 w-8 rounded" />
                                <div className="space-y-1">
                                    <Skeleton className="h-5 w-48" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                            </div>
                            <Skeleton className="h-5 w-20" />
                        </div>
                    ))}
                </div>
                <div className="bg-muted p-4 flex justify-end">
                    <Skeleton className="h-9 w-32" />
                </div>
            </div>

            {/* Actions Skeleton */}
            <div className="pt-4 flex flex-col sm:flex-row gap-4 items-center">
                <Skeleton className="h-12 w-full sm:w-48" />
                <Skeleton className="h-12 w-full sm:w-32" />
            </div>
        </div>
    );
}
