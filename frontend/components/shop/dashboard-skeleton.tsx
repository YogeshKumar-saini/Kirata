import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export function ShopDashboardSkeleton() {
    return (
        <div className="flex flex-col gap-8 pb-20 max-w-[1600px] mx-auto">
            {/* Hero Section Skeleton */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 relative">
                <div className="space-y-4 w-full md:w-1/2">
                    <Skeleton className="h-8 w-48 rounded-full" />
                    <div>
                        <Skeleton className="h-12 w-3/4 mb-2" />
                        <Skeleton className="h-6 w-1/2" />
                    </div>
                </div>

                <div className="flex gap-4">
                    <Skeleton className="h-14 w-40 rounded-2xl" />
                    <Skeleton className="h-14 w-40 rounded-2xl" />
                </div>
            </div>

            {/* Bento Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[minmax(180px,auto)]">
                {/* Revenue Card Skeleton (Large) */}
                <div className="md:col-span-2 row-span-1 md:row-span-1 lg:col-span-2">
                    <Card className="h-full border-muted bg-card/30 p-6">
                        <CardHeader className="p-0 mb-4 flex flex-row justify-between">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-6 w-16 rounded-full" />
                        </CardHeader>
                        <CardContent className="p-0">
                            <Skeleton className="h-16 w-3/4 mb-4" />
                            <Skeleton className="h-8 w-40 rounded-lg" />
                        </CardContent>
                    </Card>
                </div>

                {/* Orders Card Skeleton */}
                <div className="md:col-span-1">
                    <Card className="h-full border-muted bg-card/30 p-6">
                        <CardHeader className="p-0 mb-4">
                            <Skeleton className="h-5 w-40" />
                        </CardHeader>
                        <CardContent className="p-0">
                            <Skeleton className="h-10 w-20 mb-2" />
                            <Skeleton className="h-4 w-32" />
                        </CardContent>
                    </Card>
                </div>

                {/* Pending Actions Skeleton */}
                <div className="md:col-span-1">
                    <Card className="h-full border-muted bg-card/30 p-6">
                        <CardHeader className="p-0 mb-4">
                            <Skeleton className="h-5 w-32" />
                        </CardHeader>
                        <CardContent className="p-0">
                            <Skeleton className="h-10 w-16 mb-2" />
                            <Skeleton className="h-4 w-40" />
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity Feed Skeleton (Tall) */}
                <div className="lg:col-span-3 lg:row-span-2 h-[400px]">
                    <Card className="h-full border-muted bg-card/30 flex flex-col">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-muted p-6">
                            <div className="space-y-2">
                                <Skeleton className="h-6 w-48" />
                                <Skeleton className="h-4 w-64" />
                            </div>
                            <Skeleton className="h-10 w-32" />
                        </CardHeader>
                        <CardContent className="p-4 space-y-4 flex-1">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-muted bg-card/20">
                                    <div className="flex items-center gap-4">
                                        <Skeleton className="h-12 w-12 rounded-xl" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-5 w-32" />
                                            <Skeleton className="h-3 w-48" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-6 w-24" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Analytics Shortcut Skeleton */}
                <div className="lg:col-span-1">
                    <Card className="h-full border-muted bg-card/30 p-6 flex flex-col items-center justify-center text-center">
                        <Skeleton className="h-16 w-16 rounded-3xl mb-4" />
                        <Skeleton className="h-6 w-32 mb-2" />
                        <Skeleton className="h-4 w-24" />
                    </Card>
                </div>

                {/* Common Actions Grid Skeleton */}
                <div className="lg:col-span-1">
                    <div className="grid grid-rows-2 h-full gap-4">
                        <Card className="h-full border-muted bg-card/30 flex items-center px-6 gap-4">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div>
                                <Skeleton className="h-5 w-24 mb-1" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                        </Card>
                        <Card className="h-full border-muted bg-card/30 flex items-center px-6 gap-4">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div>
                                <Skeleton className="h-5 w-24 mb-1" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
