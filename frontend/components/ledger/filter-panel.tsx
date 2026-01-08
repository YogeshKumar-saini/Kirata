"use client"

import { Filter, X, Check, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { DateRange } from "react-day-picker"

interface FilterPanelProps {
    filters: FilterState
    onFiltersChange: (filters: FilterState) => void
    onClearFilters: () => void
    onSave?: () => void
}

export interface FilterState {
    dateRange?: DateRange
    minAmount?: string
    maxAmount?: string
    paymentTypes: string[]
}

const PAYMENT_TYPES = ['CASH', 'UPI', 'UDHAAR']

export function FilterPanel({
    filters,
    onFiltersChange,
    onClearFilters,
    onSave
}: FilterPanelProps) {


    const handlePaymentTypeToggle = (type: string) => {
        const current = filters.paymentTypes
        const next = current.includes(type)
            ? current.filter(t => t !== type)
            : [...current, type]
        onFiltersChange({ ...filters, paymentTypes: next })
    }

    const activeFilterCount = (
        (filters.dateRange ? 1 : 0) +
        (filters.minAmount ? 1 : 0) +
        (filters.maxAmount ? 1 : 0) +
        filters.paymentTypes.length
    )

    return (
        <Card className="mb-6 border-dashed">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    Advanced Filters
                    {activeFilterCount > 0 && (
                        <Badge variant="secondary" className="ml-2">
                            {activeFilterCount} Active
                        </Badge>
                    )}
                </CardTitle>
                <div className="flex gap-2">
                    {onSave && activeFilterCount > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onSave}
                            className="h-8 px-2 lg:px-3"
                        >
                            <Save className="mr-2 h-4 w-4" />
                            Save Preset
                        </Button>
                    )}
                    {activeFilterCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClearFilters}
                            className="h-8 px-2 lg:px-3"
                        >
                            <X className="mr-2 h-4 w-4" />
                            Clear
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Date Range */}
                    <div className="space-y-2">
                        <Label>Date Range</Label>
                        <DatePickerWithRange
                            date={filters.dateRange}
                            onDateChange={(range) => onFiltersChange({ ...filters, dateRange: range })}
                        />
                    </div>

                    {/* Amount Range */}
                    <div className="space-y-2">
                        <Label>Amount Range</Label>
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <span className="absolute left-2 top-2.5 text-muted-foreground">₹</span>
                                <Input
                                    type="number"
                                    placeholder="Min"
                                    className="pl-6"
                                    value={filters.minAmount || ''}
                                    onChange={(e) => onFiltersChange({ ...filters, minAmount: e.target.value })}
                                />
                            </div>
                            <span className="text-muted-foreground">-</span>
                            <div className="relative flex-1">
                                <span className="absolute left-2 top-2.5 text-muted-foreground">₹</span>
                                <Input
                                    type="number"
                                    placeholder="Max"
                                    className="pl-6"
                                    value={filters.maxAmount || ''}
                                    onChange={(e) => onFiltersChange({ ...filters, maxAmount: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Payment Types */}
                    <div className="space-y-2">
                        <Label>Payment Methods</Label>
                        <div className="flex flex-wrap gap-2 pt-1.5">
                            {PAYMENT_TYPES.map(type => {
                                const isSelected = filters.paymentTypes.includes(type)
                                return (
                                    <Badge
                                        key={type}
                                        variant={isSelected ? "default" : "outline"}
                                        className={cn(
                                            "cursor-pointer hover:bg-primary/90 transition-colors px-3 py-1",
                                            !isSelected && "hover:bg-accent"
                                        )}
                                        onClick={() => handlePaymentTypeToggle(type)}
                                    >
                                        {isSelected && <Check className="mr-1 h-3 w-3" />}
                                        {type}
                                    </Badge>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
