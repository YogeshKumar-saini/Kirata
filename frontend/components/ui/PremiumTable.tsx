"use client";

import React, { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal, ArrowUpDown, ArrowUp, ArrowDown, LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// --- Types ---

export interface Column<T> {
    header: string | React.ReactNode;
    accessorKey?: keyof T;
    cell?: (item: T) => React.ReactNode;
    className?: string;
    sortable?: boolean;
}

interface FilterOption {
    label: string;
    value: string;
}

interface FilterConfig {
    key: string;
    label: string;
    options: FilterOption[];
    onFilterChange?: (value: string) => void;
}

interface PremiumTableProps<T> {
    data: T[];
    columns: Column<T>[];
    isLoading?: boolean;
    searchKey?: keyof T;
    searchPlaceholder?: string;
    onSearch?: (term: string) => void;
    filterConfig?: FilterConfig;
    pagination?: boolean;
    itemsPerPage?: number;
    // Server-side pagination props
    manualPagination?: boolean;
    totalPageCount?: number;
    currentPage?: number;
    onPageChange?: (page: number) => void;
    // Server-side sorting props
    manualSorting?: boolean;
    onSortChange?: (key: keyof T, direction: "asc" | "desc") => void;
    emptyStateConfig?: {
        title: string;
        description: string;
        actionLabel?: string;
        onAction?: () => void;
        icon: LucideIcon;
    };
}

// --- Component ---

export function PremiumTable<T extends { id?: string | number }>({
    data,
    columns,
    isLoading = false,
    searchKey,
    searchPlaceholder = "Search...",
    onSearch,
    filterConfig,
    pagination = true,
    itemsPerPage = 10,
    manualPagination = false,
    totalPageCount,
    currentPage: propCurrentPage,
    onPageChange,
    manualSorting = false,
    onSortChange,
    emptyStateConfig,
}: PremiumTableProps<T>) {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterValue, setFilterValue] = useState<string>("all");
    const [internalCurrentPage, setInternalCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState<{ key: keyof T; direction: "asc" | "desc" } | null>(null);

    // Use internal or prop page
    const distinctCurrentPage = manualPagination ? (propCurrentPage || 1) : internalCurrentPage;

    // Handle Search
    useEffect(() => {
        if (manualPagination && onSearch) {
            const timer = setTimeout(() => {
                onSearch(searchTerm);
            }, 300); // Debounce
            return () => clearTimeout(timer);
        }
    }, [searchTerm, manualPagination, onSearch]);

    // Handle Filter
    const handleFilterChange = (val: string) => {
        setFilterValue(val);
        if (filterConfig?.onFilterChange) {
            filterConfig.onFilterChange(val);
        }
        if (!manualPagination) {
            setInternalCurrentPage(1);
        }
    };


    // Filter & Search Logic (Client-side only)
    const filteredData = React.useMemo(() => {
        if (manualPagination) return data; // Return raw data if server-side

        let filtered = [...data];

        // 1. Search
        if (searchKey && searchTerm) {
            filtered = filtered.filter((item) => {
                const value = item[searchKey];
                return String(value).toLowerCase().includes(searchTerm.toLowerCase());
            });
        }

        // 2. Filter
        if (filterConfig && filterValue !== "all") {
            filtered = filtered.filter((item) => {
                const value = item[filterConfig.key as keyof T];
                return String(value) === filterValue;
            });
        }

        // 3. Sort
        if (sortConfig && !manualSorting) {
            filtered.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
                return 0;
            });
        }

        return filtered;
    }, [data, searchKey, searchTerm, filterConfig, filterValue, sortConfig, manualPagination, manualSorting]);

    // Pagination Logic
    const totalPages = manualPagination ? (totalPageCount || 1) : Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = manualPagination
        ? data // Data is already paginated from server
        : (pagination
            ? filteredData.slice((internalCurrentPage - 1) * itemsPerPage, internalCurrentPage * itemsPerPage)
            : filteredData);

    const handleSort = (key: keyof T) => {
        let newDirection: "asc" | "desc" = "asc";
        if (sortConfig?.key === key && sortConfig.direction === "asc") {
            newDirection = "desc";
        }
        setSortConfig({ key, direction: newDirection });

        if (manualSorting && onSortChange) {
            onSortChange(key, newDirection);
        }
    };

    const changePage = (page: number) => {
        if (manualPagination && onPageChange) {
            onPageChange(page);
        } else {
            setInternalCurrentPage(page);
        }
    };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            {(searchKey || filterConfig) && (
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card/50 p-4 rounded-xl border border-border/40 backdrop-blur-sm">
                    {searchKey && (
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={searchPlaceholder}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 bg-background/50 border-border/50 focus:border-primary/50 transition-all rounded-lg"
                            />
                        </div>
                    )}

                    {filterConfig && (
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <SlidersHorizontal className="h-4 w-4 text-muted-foreground hidden sm:block" />
                            <Select value={filterValue} onValueChange={handleFilterChange}>
                                <SelectTrigger className="w-full sm:w-[180px] bg-background/50 border-border/50 rounded-lg">
                                    <SelectValue placeholder={`Filter by ${filterConfig.label}`} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All {filterConfig.label}s</SelectItem>
                                    {filterConfig.options.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>
            )}

            {/* Table Container */}
            <div className="rounded-xl border border-border/40 overflow-hidden bg-card/30 backdrop-blur-sm shadow-sm relative min-h-[400px]">
                <Table>
                    <TableHeader className="bg-muted/30">
                        <TableRow className="hover:bg-transparent border-border/40">
                            {columns.map((col, index) => (
                                <TableHead
                                    key={index}
                                    className={cn("h-12 text-xs uppercase tracking-wider font-semibold text-muted-foreground/80", col.className)}
                                >
                                    {col.sortable && col.accessorKey ? (
                                        <div
                                            className="flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors group"
                                            onClick={() => handleSort(col.accessorKey!)}
                                        >
                                            {col.header}
                                            <span className="text-muted-foreground/30 group-hover:text-primary transition-colors">
                                                {sortConfig?.key === col.accessorKey ? (
                                                    sortConfig.direction === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                                                ) : (
                                                    <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                                                )}
                                            </span>
                                        </div>
                                    ) : (
                                        col.header
                                    )}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            // Loading Skeletons
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i} className="border-border/40">
                                    {columns.map((_, j) => (
                                        <TableCell key={j} className="py-4">
                                            <Skeleton className="h-4 w-full rounded bg-muted/20" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : paginatedData.length === 0 ? (
                            // Empty State
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-[400px] text-center border-none">
                                    {emptyStateConfig ? (
                                        <EmptyState
                                            icon={emptyStateConfig.icon}
                                            title={emptyStateConfig.title}
                                            description={emptyStateConfig.description}
                                            actionLabel={emptyStateConfig.actionLabel}
                                            onAction={emptyStateConfig.onAction}
                                            className="border-none bg-transparent shadow-none"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                                            <p>No results found.</p>
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                        ) : (
                            // Data Rows
                            <AnimatePresence mode="wait">
                                {paginatedData.map((item, i) => (
                                    <motion.tr
                                        key={item.id ? String(item.id) : i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2, delay: i * 0.05 }}
                                        className="group hover:bg-muted/30 border-border/40 transition-colors"
                                    >
                                        {columns.map((col, j) => (
                                            <TableCell key={j} className={cn("py-3 font-medium text-sm text-foreground/80", col.className)}>
                                                {col.cell
                                                    ? col.cell(item)
                                                    : col.accessorKey
                                                        ? (item[col.accessorKey] as React.ReactNode)
                                                        : null}
                                            </TableCell>
                                        ))}
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {pagination && totalPages > 1 && (
                <div className="flex items-center justify-between px-2">
                    <p className="text-xs text-muted-foreground">
                        Showing <span className="font-medium text-foreground">{(distinctCurrentPage - 1) * itemsPerPage + 1}</span> to{" "}
                        <span className="font-medium text-foreground">{Math.min(distinctCurrentPage * itemsPerPage, manualPagination ? (totalPageCount || 1) * itemsPerPage : filteredData.length)}</span> results
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            disabled={distinctCurrentPage === 1}
                            onClick={() => changePage(Math.max(distinctCurrentPage - 1, 1))}
                            className="h-8 w-8 rounded-lg border-border/50"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="text-xs font-medium px-2">
                            Page {distinctCurrentPage} of {totalPages}
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            disabled={distinctCurrentPage === totalPages}
                            onClick={() => changePage(Math.min(distinctCurrentPage + 1, totalPages))}
                            className="h-8 w-8 rounded-lg border-border/50"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
