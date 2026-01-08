'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLedgerPagination } from "@/hooks/use-ledger-pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Download, PlusCircle, DollarSign, TrendingUp, TrendingDown, Users, Filter, Bookmark, Edit, Trash2, X, FileText, Banknote, QrCode, CreditCard } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useCallback, useMemo } from "react";
import api from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

import { EditTransactionModal } from "@/components/ledger/edit-transaction-modal";
import { DeleteTransactionDialog } from "@/components/ledger/delete-transaction-dialog";
import { BulkDeleteDialog } from "@/components/ledger/bulk-delete-dialog";
import { BulkEditDialog } from "@/components/ledger/bulk-edit-dialog";
import { ReceiptDialog } from '@/components/ledger/receipt-dialog';
import { SaveFilterDialog } from "@/components/ledger/save-filter-dialog";
import { FilterPanel, FilterState } from "@/components/ledger/filter-panel";
import { LedgerSkeleton } from "@/components/ledger/ledger-skeleton";
import { AdvancedCharts } from "@/components/ledger/advanced-charts";
import { TransactionCard } from "@/components/ledger/transaction-card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { PageHeader } from "@/components/ui/PageHeader";
import { PremiumTable, Column } from "@/components/ui/PremiumTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";

interface Sale {
    id: string; // Required for PremiumTable
    saleId: string;
    amount: number;
    paymentType: string;
    source: string;
    createdAt: string;
    customer?: {
        id: string;
        name: string | null;
        phone: string | null;
        uniqueId: string;
    };
}

interface Summary {
    totalRevenue: number;
    totalTransactions: number;
    averageTransactionValue: number;
    cashAmount: number;
    upiAmount: number;
    udhaarAmount: number;
    byPaymentType: Record<string, { count: number; amount: number }>;
    topCustomers: { customerId: string; customerName: string; count: number; amount: number }[];
    dailyBreakdown: { date: string; amount: number; count: number }[];
}

export default function SalesLedgerPage() {
    const [viewMode, setViewMode] = useState<'transactions' | 'customers'>('transactions');

    // Filters State
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<FilterState>({
        paymentTypes: []
    });
    const [isFiltersLoaded, setIsFiltersLoaded] = useState(false);
    const [presets, setPresets] = useState<{ name: string; filters: FilterState }[]>([]);
    const [saveFilterOpen, setSaveFilterOpen] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    // Pagination Hook
    const {
        sales,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: salesLoading,
        refetch: refetchSales
    } = useLedgerPagination({
        limit: 20,
        filters: {
            search: searchQuery,
            paymentType: filters.paymentTypes?.length === 1 ? filters.paymentTypes[0] : undefined,
            startDate: filters.dateRange?.from,
            endDate: filters.dateRange?.to,
            minAmount: filters.minAmount ? parseFloat(filters.minAmount) : undefined,
            maxAmount: filters.maxAmount ? parseFloat(filters.maxAmount) : undefined,
        }
    });

    const [summary, setSummary] = useState<Summary | null>(null);
    const todaysSales = summary?.dailyBreakdown?.find(d => d.date === new Date().toISOString().split('T')[0])?.amount || 0;
    const [loadingSummary, setLoadingSummary] = useState(true);
    const loading = salesLoading || (loadingSummary && !summary);

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
    const [bulkEditOpen, setBulkEditOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Sale | null>(null);
    const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [error, setError] = useState<string | null>(null);
    const [receiptTransaction, setReceiptTransaction] = useState<Sale | null>(null);

    // Load filters from local storage on mount
    useEffect(() => {
        const saved = localStorage.getItem('ledger_filters');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.dateRange?.from) parsed.dateRange.from = new Date(parsed.dateRange.from);
                if (parsed.dateRange?.to) parsed.dateRange.to = new Date(parsed.dateRange.to);
                setFilters(parsed);
            } catch (e) {
                console.error("Failed to parse saved filters", e);
            }
        }
        setIsFiltersLoaded(true);

        api.get('/preferences').then(res => {
            if (res.data.preferences?.filterPresets) {
                setPresets(res.data.preferences.filterPresets);
            }
        }).catch(err => console.error("Failed to load presets", err));
    }, []);

    // Save filters to local storage
    useEffect(() => {
        if (isFiltersLoaded) {
            localStorage.setItem('ledger_filters', JSON.stringify(filters));
        }
    }, [filters, isFiltersLoaded]);

    const fetchSummary = useCallback(async () => {
        try {
            setLoadingSummary(true);
            const summaryParams = new URLSearchParams();
            if (filters.dateRange?.from) {
                summaryParams.append('startDate', filters.dateRange.from.toISOString());
                if (filters.dateRange.to) {
                    summaryParams.append('endDate', filters.dateRange.to.toISOString());
                } else {
                    summaryParams.append('endDate', filters.dateRange.from.toISOString());
                }
            }

            const summaryResponse = await api.get(`/ledger/summary?${summaryParams.toString()}`);
            setSummary(summaryResponse.data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch summary:', err);
        } finally {
            setLoadingSummary(false);
        }
    }, [filters]);

    useEffect(() => {
        if (!isFiltersLoaded) return;
        fetchSummary();
    }, [filters, isFiltersLoaded, fetchSummary]);

    useEffect(() => {
        if (isFiltersLoaded) {
            fetchSummary();
        }
    }, [isFiltersLoaded, fetchSummary]);

    const downloadFile = (data: Blob, extension: string) => {
        const url = window.URL.createObjectURL(new Blob([data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `sales-export-${new Date().toISOString().split('T')[0]}.${extension}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    const buildExportParams = () => {
        const params = new URLSearchParams();
        filters.paymentTypes.forEach(type => params.append('paymentType', type));
        if (filters.minAmount) params.append('minAmount', filters.minAmount);
        if (filters.maxAmount) params.append('maxAmount', filters.maxAmount);

        if (filters.dateRange?.from) {
            params.append('startDate', filters.dateRange.from.toISOString());
            if (filters.dateRange.to) {
                params.append('endDate', filters.dateRange.to.toISOString());
            } else {
                params.append('endDate', filters.dateRange.from.toISOString());
            }
        }
        return params;
    };

    const handleExportCSV = async () => {
        try {
            const params = buildExportParams();
            const response = await api.get(`/ledger/export/csv?${params.toString()}`, {
                responseType: 'blob'
            });
            downloadFile(response.data, 'csv');
        } catch (err: unknown) {
            console.error('Failed to export CSV:', err);
            setError('Failed to export CSV data');
        }
    };

    const handleExportExcel = async (ids?: string[]) => {
        try {
            const params = buildExportParams();
            if (ids && ids.length > 0) {
                params.append('ids', ids.join(','));
            }

            const response = await api.get(`/ledger/export/excel?${params.toString()}`, {
                responseType: 'blob'
            });
            downloadFile(response.data, 'xlsx');
        } catch (err: unknown) {
            console.error('Failed to export Excel:', err);
            setError('Failed to export Excel data');
        }
    };

    const clearFilters = () => {
        setFilters({ paymentTypes: [] });
    };

    const toggleSelection = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === sales.length && sales.length > 0) {
            setSelectedIds(new Set());
        } else {
            const newSelected = new Set(sales.map((s: Sale) => s.saleId));
            setSelectedIds(newSelected);
        }
    };

    const handleBulkDeleteSuccess = () => {
        refetchSales();
        fetchSummary();
        setSelectedIds(new Set());
        setBulkDeleteDialogOpen(false);
    };

    const handleBulkEditSuccess = () => {
        refetchSales();
        fetchSummary();
        setSelectedIds(new Set());
    };

    const refreshData = () => {
        refetchSales();
        fetchSummary();
    };

    const handleSavePreset = async (name: string) => {
        try {
            const newPreset = { name, filters };
            const updatedPresets = [...presets, newPreset];
            await api.patch('/preferences', { filterPresets: updatedPresets });
            setPresets(updatedPresets);
        } catch (err) {
            console.error("Failed to save preset", err);
        }
    };

    const handleLoadPreset = (preset: { name: string; filters: FilterState }) => {
        const filtersToLoad = { ...preset.filters };
        if (filtersToLoad.dateRange?.from) filtersToLoad.dateRange.from = new Date(filtersToLoad.dateRange.from);
        if (filtersToLoad.dateRange?.to) filtersToLoad.dateRange.to = new Date(filtersToLoad.dateRange.to);

        setFilters(filtersToLoad);
        setShowFilters(true);
    };

    const handleDeletePreset = async (index: number, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const updatedPresets = presets.filter((_, i) => i !== index);
            await api.patch('/preferences', { filterPresets: updatedPresets });
            setPresets(updatedPresets);
        } catch (err) {
            console.error("Failed to delete preset", err);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return (
            <div className="flex flex-col">
                <span className="font-medium">
                    {date.toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short'
                    })}
                </span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(date, { addSuffix: true })}
                </span>
            </div>
        );
    };

    const getPaymentBadgeColor = (paymentType: string) => {
        switch (paymentType) {
            case 'CASH':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'UPI':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            case 'UDHAAR':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
        }
    };

    const columns: Column<Sale>[] = useMemo(() => [
        {
            header: (
                <Checkbox
                    checked={sales.length > 0 && selectedIds.size === sales.length}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all"
                />
            ),
            cell: (sale) => (
                <Checkbox
                    checked={selectedIds.has(sale.saleId)}
                    onCheckedChange={() => toggleSelection(sale.saleId)}
                    aria-label={`Select transaction ${sale.saleId}`}
                />
            ),
            className: "w-12 text-center"
        },
        {
            header: "Date",
            accessorKey: "createdAt",
            cell: (sale) => formatDate(sale.createdAt),
            className: "min-w-[120px]"
        },
        {
            header: "Customer",
            cell: (sale) => sale.customer ? (
                <Link href={`/shop/customers/${sale.customer.id}`} className="hover:underline group">
                    <div className="font-medium group-hover:text-primary transition-colors">
                        {sale.customer.name || 'Unknown'}
                    </div>
                    {sale.customer.phone && (
                        <div className="text-xs text-muted-foreground">
                            {sale.customer.phone}
                        </div>
                    )}
                </Link>
            ) : (
                <span className="text-muted-foreground text-sm">-</span>
            )
        },
        {
            header: "Payment",
            accessorKey: "paymentType",
            cell: (sale) => (
                <span className={cn(`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border`, getPaymentBadgeColor(sale.paymentType).replace('bg-', 'border-').replace('text-', 'bg-transparent text-'))}>
                    {sale.paymentType === 'CASH' && <Banknote className="h-3 w-3" />}
                    {sale.paymentType === 'UPI' && <QrCode className="h-3 w-3" />}
                    {sale.paymentType === 'UDHAAR' && <CreditCard className="h-3 w-3" />}
                    {sale.paymentType}
                </span>
            )
        },
        {
            header: "Source",
            accessorKey: "source",
            cell: (sale) => <span className="text-xs text-muted-foreground uppercase tracking-wider">{sale.source}</span>
        },
        {
            header: "Amount",
            accessorKey: "amount",
            cell: (sale) => <div className="font-bold text-base">₹{Number(sale.amount).toFixed(2)}</div>,
            className: "text-right"
        },
        {
            header: "Actions",
            cell: (sale) => (
                <div className="flex justify-end gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={() => setReceiptTransaction(sale)}
                        title="Receipt"
                    >
                        <FileText className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        onClick={() => {
                            setSelectedTransaction(sale);
                            setEditModalOpen(true);
                        }}
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => {
                            setTransactionToDelete(sale.saleId);
                            setDeleteDialogOpen(true);
                        }}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
            className: "text-right"
        }
    ], [selectedIds, sales, toggleSelectAll]);

    return (
        <div className="space-y-6 pb-20">
            <PageHeader
                title="Sales Ledger"
                description="Comprehensive financial tracking and analytics"
                actions={
                    <div className="flex flex-wrap gap-2">
                        <div className="hidden md:flex flex-col items-end justify-center px-4 py-1 mr-2 bg-green-500/10 text-green-600 rounded-lg border border-green-500/20">
                            <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">Today</span>
                            <span className="text-lg font-bold leading-none">₹{todaysSales.toFixed(0)}</span>
                        </div>
                        <Button asChild size="sm" className="hidden sm:flex">
                            <Link href="/shop/ledger/new">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Record Sale
                            </Link>
                        </Button>
                        <Button asChild variant="secondary" size="sm" className="hidden sm:flex">
                            <Link href="/shop/ledger/payment">
                                <DollarSign className="mr-2 h-4 w-4" />
                                Payment
                            </Link>
                        </Button>
                        <Button
                            variant={showFilters ? "secondary" : "outline"}
                            onClick={() => setShowFilters(!showFilters)}
                            size="sm"
                        >
                            <Filter className="mr-2 h-4 w-4" />
                            Filters
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <Download className="mr-2 h-4 w-4" />
                                    Export
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleExportExcel()}>Excel (.xlsx)</DropdownMenuItem>
                                <DropdownMenuItem onClick={handleExportCSV}>CSV (.csv)</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        {presets.length > 0 && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <Bookmark className="mr-2 h-4 w-4" />
                                        Load
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    {presets.map((preset, idx) => (
                                        <DropdownMenuItem key={idx} onClick={() => handleLoadPreset(preset)} className="flex justify-between groups">
                                            <span>{preset.name}</span>
                                            <Trash2
                                                className="h-4 w-4 text-muted-foreground hover:text-red-500 cursor-pointer"
                                                onClick={(e) => handleDeletePreset(idx, e)}
                                            />
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                }
            />

            <BulkDeleteDialog
                open={bulkDeleteDialogOpen}
                onOpenChange={setBulkDeleteDialogOpen}
                count={selectedIds.size}
                transactionIds={Array.from(selectedIds)}
                onSuccess={handleBulkDeleteSuccess}
            />

            <BulkEditDialog
                open={bulkEditOpen}
                onOpenChange={setBulkEditOpen}
                saleIds={Array.from(selectedIds)}
                onSuccess={handleBulkEditSuccess}
            />

            <SaveFilterDialog
                open={saveFilterOpen}
                onOpenChange={setSaveFilterOpen}
                onSave={handleSavePreset}
            />

            {showFilters && (
                <FilterPanel
                    filters={filters}
                    onFiltersChange={setFilters}
                    onClearFilters={clearFilters}
                    onSave={() => setSaveFilterOpen(true)}
                />
            )}

            {error && (
                <div className="p-4 border border-red-500/20 bg-red-500/10 rounded-lg text-red-600 dark:text-red-400 font-medium">
                    {error}
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Card className="glass border-border/40">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
                        <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
                        {loadingSummary ? (
                            <div className="h-8 w-24 bg-muted animate-pulse rounded" />
                        ) : (
                            <>
                                <div className="text-xl md:text-2xl font-bold">₹{summary?.totalRevenue.toFixed(0) || '0'}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {summary?.totalTransactions || 0} transactions
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card className="glass border-green-500/20 bg-green-500/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
                        <CardTitle className="text-xs md:text-sm font-medium text-green-600/80">Cash</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
                        {loadingSummary ? (
                            <div className="h-8 w-24 bg-muted animate-pulse rounded" />
                        ) : (
                            <>
                                <div className="text-xl md:text-2xl font-bold text-green-600">
                                    ₹{summary?.cashAmount.toFixed(0) || '0'}
                                </div>
                                <p className="text-xs text-green-600/60 mt-1">
                                    {summary?.byPaymentType?.CASH?.count || 0} transactions
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card className="glass border-red-500/20 bg-red-500/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
                        <CardTitle className="text-xs md:text-sm font-medium text-red-600/80">Udhaar</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
                        {loadingSummary ? (
                            <div className="h-8 w-24 bg-muted animate-pulse rounded" />
                        ) : (
                            <>
                                <div className="text-xl md:text-2xl font-bold text-red-600">
                                    ₹{summary?.udhaarAmount.toFixed(0) || '0'}
                                </div>
                                <p className="text-xs text-red-600/60 mt-1">
                                    {summary?.byPaymentType?.UDHAAR?.count || 0} transactions
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card className="glass border-border/40">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
                        <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">Avg Ticket</CardTitle>
                        <Users className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
                        {loadingSummary ? (
                            <div className="h-8 w-24 bg-muted animate-pulse rounded" />
                        ) : (
                            <>
                                <div className="text-xl md:text-2xl font-bold">
                                    ₹{summary?.averageTransactionValue.toFixed(0) || '0'}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Per transaction
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Advanced Charts */}
            <AdvancedCharts summary={summary} />

            {/* Tabs for different views */}
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'transactions' | 'customers')}>
                <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-6">
                    <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
                    <TabsTrigger value="customers">Top Customers</TabsTrigger>
                </TabsList>

                <TabsContent value="transactions" className="space-y-4">
                    {/* Search Bar - only show if filters panel is closed to avoid double search */}
                    {!showFilters && (
                        <div className="relative max-w-md mx-auto mb-6">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search transactions..."
                                className="pl-10 h-10 bg-card/50 backdrop-blur-sm border-border/50"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    )}

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-3">
                        {loading ? (
                            <LedgerSkeleton />
                        ) : sales.length === 0 ? (
                            <EmptyState
                                icon={FileText}
                                title="No transactions found"
                                description={searchQuery ? "Try adjusting your search or filters." : "Start recording sales to see them here."}
                                actionLabel="Record Sale"
                                onAction={() => window.location.href = '/shop/ledger/new'}
                            />
                        ) : (
                            sales.map((sale: Sale) => (
                                <TransactionCard
                                    key={sale.saleId}
                                    sale={sale}
                                    onEdit={(s) => {
                                        setSelectedTransaction(s as unknown as Sale);
                                        setEditModalOpen(true);
                                    }}
                                    onDelete={(id: string) => {
                                        setTransactionToDelete(id);
                                        setDeleteDialogOpen(true);
                                    }}
                                />
                            ))
                        )}
                        {hasNextPage && (
                            <div className="flex justify-center py-4">
                                <Button
                                    variant="ghost"
                                    onClick={() => fetchNextPage()}
                                    disabled={isFetchingNextPage}
                                    className="w-full"
                                >
                                    {isFetchingNextPage ? 'Loading...' : 'Load More'}
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden md:block">
                        <PremiumTable
                            data={sales}
                            columns={columns}
                            isLoading={loading}
                            pagination={false} // We use infinite scroll
                            emptyStateConfig={{
                                icon: FileText,
                                title: "No transactions found",
                                description: searchQuery ? "Try adjusting your search or filters." : "Start recording sales to see them here.",
                                actionLabel: "Record Sale",
                                onAction: () => window.location.href = '/shop/ledger/new'
                            }}
                        />

                        {hasNextPage && (
                            <div className="flex justify-center pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => fetchNextPage()}
                                    disabled={isFetchingNextPage}
                                >
                                    {isFetchingNextPage ? 'Loading more...' : 'Load More Transactions'}
                                </Button>
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="customers">
                    <div className="text-center py-12 text-muted-foreground">
                        <div className="max-w-md mx-auto bg-card rounded-xl border border-border/40 p-8 shadow-sm">
                            <Users className="h-12 w-12 mx-auto mb-4 text-primary/50" />
                            <h3 className="text-lg font-semibold text-foreground mb-2">Customer Analytics</h3>
                            <p className="mb-6">View top customers and their buying habits here.</p>
                            <Button asChild>
                                <Link href="/shop/customers">View All Customers</Link>
                            </Button>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Edit Transaction Modal */}
            {receiptTransaction && (
                <ReceiptDialog
                    open={!!receiptTransaction}
                    onOpenChange={(open) => !open && setReceiptTransaction(null)}
                    transaction={receiptTransaction}
                />
            )}

            <EditTransactionModal
                open={editModalOpen}
                onOpenChange={setEditModalOpen}
                transaction={selectedTransaction}
                onSuccess={refreshData}
            />

            {/* Delete Transaction Dialog */}
            <DeleteTransactionDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                transactionId={transactionToDelete}
                onSuccess={refreshData}
            />

            {/* Floating Bulk Action Bar */}
            {selectedIds.size > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-popover/95 backdrop-blur-md border shadow-2xl rounded-full px-6 py-2 flex items-center gap-4 animate-in slide-in-from-bottom-4 duration-200 z-50">
                    <span className="text-sm font-medium pr-2 border-r border-border/50">
                        {selectedIds.size} selected
                    </span>
                    <Button
                        variant="secondary"
                        size="sm"
                        className="h-8 rounded-full"
                        onClick={() => setBulkEditOpen(true)}
                    >
                        <Edit className="mr-2 h-3.5 w-3.5" />
                        Edit
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 rounded-full text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setBulkDeleteDialogOpen(true)}
                    >
                        <Trash2 className="mr-2 h-3.5 w-3.5" />
                        Delete
                    </Button>
                    <Button
                        variant="default"
                        size="sm"
                        className="h-8 rounded-full shadow-lg shadow-primary/20"
                        onClick={() => handleExportExcel(Array.from(selectedIds))}
                    >
                        <Download className="mr-2 h-3.5 w-3.5" />
                        Export
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 ml-2 rounded-full hover:bg-muted"
                        onClick={() => setSelectedIds(new Set())}
                    >
                        <X className="h-3.5 w-3.5" />
                    </Button>
                </div>
            )}
        </div>
    );
}
