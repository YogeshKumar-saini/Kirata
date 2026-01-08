import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, FileText, Edit, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { useSwipeable } from "react-swipeable"
import { useState } from "react"

interface Transaction {
    saleId: string;
    amount: number;
    paymentType: string;
    source: string;
    createdAt: string;
    customer?: {
        name: string | null;
        phone?: string | null;
    } | null;
    notes?: string;
}

interface TransactionCardProps {
    sale: Transaction;
    onEdit: (sale: Transaction) => void;
    onDelete: (saleId: string) => void;
}

export function TransactionCard({ sale, onEdit, onDelete }: TransactionCardProps) {
    const [offset, setOffset] = useState(0);
    const isCredit = sale.paymentType === 'UDHAAR';

    const handlers = useSwipeable({
        onSwipedLeft: () => setOffset(-120),
        onSwipedRight: () => setOffset(0),
        onTouchStartOrOnMouseDown: () => {
            // Optional: Close others? For now just handle self.
        },
        trackMouse: true
    });

    const getPaymentBadgeColor = (type: string) => {
        switch (type) {
            case 'CASH': return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
            case 'UPI': return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
            case 'UDHAAR': return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <div {...handlers} className="relative mb-3 overflow-hidden rounded-xl bg-background touch-pan-y select-none">
            {/* Actions Background */}
            <div className="absolute inset-y-0 right-0 flex w-[120px] rounded-r-xl overflow-hidden">
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit(sale);
                        setOffset(0);
                    }}
                    className="flex-1 bg-blue-500 flex items-center justify-center text-white cursor-pointer hover:bg-blue-600 transition-colors"
                >
                    <Edit size={18} />
                </div>
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(sale.saleId);
                        setOffset(0);
                    }}
                    className="flex-1 bg-red-500 flex items-center justify-center text-white cursor-pointer hover:bg-red-600 transition-colors"
                >
                    <Trash2 size={18} />
                </div>
            </div>

            {/* Main Card */}
            <Card
                className="transition-transform duration-200 ease-out border shadow-sm relative z-10 bg-card"
                style={{ transform: `translateX(${offset}px)` }}
            >
                <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(sale.createdAt), 'dd MMM, hh:mm a')}
                            </span>
                            <span className="font-semibold text-sm mt-1">
                                {sale.customer?.name || 'Walk-in Customer'}
                            </span>
                        </div>
                        <div className="text-right">
                            <div className={`text-lg font-bold ${isCredit ? 'text-red-600' : 'text-green-600'}`}>
                                ₹{Number(sale.amount).toFixed(2)}
                            </div>
                            <Badge variant="outline" className={`border-0 text-xs ${getPaymentBadgeColor(sale.paymentType)}`}>
                                {sale.paymentType}
                            </Badge>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1 mt-2 text-sm text-muted-foreground border-t pt-2">
                        <div className="flex justify-between">
                            <span className="flex items-center gap-1 text-xs">
                                <FileText className="h-3 w-3" />
                                {sale.saleId.substring(0, 8)}...
                            </span>
                            <span className="text-xs">{sale.source}</span>
                        </div>
                        {sale.notes && (
                            <div className="text-xs italic bg-muted/50 p-1.5 rounded mt-1">
                                &quot;{sale.notes}&quot;
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
