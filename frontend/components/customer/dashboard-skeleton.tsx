import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
    return (
        <div className="space-y-8 p-1 sm:p-2">
            {/* Greeting Section Skeleton */}
            <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
                <div className="space-y-2">
                    <Skeleton className="h-12 w-64 md:w-96 rounded-full" />
                    <Skeleton className="h-6 w-48 rounded-full" />
                </div>
                <Skeleton className="h-12 w-40 rounded-full" />
            </div>

            {/* Bento Grid Stats Skeleton */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* Total Udhaar Card Skeleton */}
                <div className="col-span-1 md:col-span-2 relative overflow-hidden rounded-3xl border border-muted p-8 h-64 flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                        <Skeleton className="h-14 w-14 rounded-2xl" />
                        <Skeleton className="h-8 w-24 rounded-full" />
                    </div>
                    <div className="space-y-4">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-16 w-48" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                    <Skeleton className="h-10 w-full mt-auto rounded-lg" />
                </div>

                {/* Active Orders Card Skeleton */}
                <div className="p-6 rounded-3xl border border-muted flex flex-col h-64">
                    <div className="mb-4">
                        <Skeleton className="h-12 w-12 rounded-xl" />
                    </div>
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-10 w-16" />
                    </div>
                    <Skeleton className="h-5 w-24 mt-4" />
                </div>

                {/* Quick Action: Discover Skeleton */}
                <div className="p-6 rounded-3xl border border-muted flex flex-col h-64">
                    <div className="mb-4">
                        <Skeleton className="h-12 w-12 rounded-xl" />
                    </div>
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-28" />
                        <Skeleton className="h-4 w-40" />
                    </div>
                    <Skeleton className="h-5 w-24 mt-4" />
                </div>
            </div>

            {/* Recent Activity Feed Skeleton */}
            <div className="grid gap-6 lg:grid-cols-7">
                <div className="lg:col-span-5 space-y-6">
                    <div className="flex items-center justify-between px-1">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-8 w-32" />
                    </div>

                    <div className="rounded-3xl border border-muted p-6 space-y-6">
                        {/* List Items */}
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <Skeleton className="h-12 w-12 rounded-2xl" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-5 w-32" />
                                        <Skeleton className="h-3 w-40" />
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-6 w-20" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Side Widgets Skeleton */}
                <div className="lg:col-span-2 space-y-6">
                    {/* My Khatabook Skeleton */}
                    <div className="rounded-3xl border border-muted p-6 h-64 bg-muted/10">
                        <Skeleton className="h-8 w-40 mb-2" />
                        <Skeleton className="h-4 w-48 mb-6" />
                        <Skeleton className="h-10 w-full rounded-lg mt-auto" />
                    </div>

                    {/* Quick Links Skeleton */}
                    <div className="rounded-3xl border border-muted p-6 space-y-4">
                        <Skeleton className="h-6 w-24 mb-2" />
                        <Skeleton className="h-10 w-full rounded-xl" />
                        <Skeleton className="h-10 w-full rounded-xl" />
                    </div>
                </div>
            </div>
        </div>
    );
}
