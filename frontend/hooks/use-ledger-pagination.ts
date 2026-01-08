
import { useInfiniteQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/auth-context';
import api from '@/lib/api';

interface UseLedgerPaginationProps {
    limit?: number;
    filters?: Record<string, unknown>;
}

export function useLedgerPagination({ limit = 50, filters = {} }: UseLedgerPaginationProps = {}) {
    const { user } = useAuth();

    // Construct query key based on filters so it refreshes when filters change
    const queryKey = ['ledger-sales', JSON.stringify(filters)];

    const fetchSales = async ({ pageParam = undefined }: { pageParam?: string }) => {
        const params: Record<string, unknown> = {
            limit: limit,
            cursor: pageParam
        };

        // Add filters
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                if (value instanceof Date) {
                    params[key] = value.toISOString();
                } else {
                    params[key] = value;
                }
            }
        });

        const { data } = await api.get('/ledger/sales', { params });
        return data;
    };

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
        refetch
    } = useInfiniteQuery({
        queryKey,
        queryFn: fetchSales,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        initialPageParam: undefined,
        enabled: !!user
    });

    // Flatten pages into a single array of sales
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sales = data?.pages.flatMap(page => page.sales.map((s: any) => ({ ...s, id: s.saleId }))) || [];
    // const totalCount = data?.pages[0]?.count || 0; // Unused

    return {
        sales,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
        refetch
    };
}
