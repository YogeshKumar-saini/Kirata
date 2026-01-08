"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import {
    Loader2,
    Plus,
    History,
    Scale,
    AlertTriangle,
    CheckCircle2,
    ArrowUpRight,
    ArrowDownLeft,
    FileText,
    MessageCircle,
    Wallet,
    ChevronRight,
    User
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddLedgerEntryDialog } from '@/components/customer/add-ledger-entry-dialog';
import { generateWhatsappLink, generateBalanceUpdateMessage } from '@/lib/whatsapp';
import { motion } from 'framer-motion';

interface Entry {
    id: string;
    amount: string;
    type: 'GAVE' | 'TOOK';
    notes?: string;
    createdAt: string;
}

interface TeammateRecord {
    id?: string;
    saleId?: string;
    amount: string;
    paymentType?: string;
    type?: string;
    createdAt: string;
    notes?: string;
}

interface ContactDetails {
    myEntries: Entry[];
    myStats: { balance: number };
    teammateInfo: {
        name: string;
        type: 'SHOP' | 'CUSTOMER';
    } | null;
    teammateRecords: TeammateRecord[];
}

export default function ContactLedgerDetailsPage() {
    const params = useParams();
    const phone = params.phone as string;
    const [details, setDetails] = useState<ContactDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [settleData, setSettleData] = useState<{ amount: string; type: 'GAVE' | 'TOOK' } | null>(null);

    const fetchDetails = React.useCallback(async (showLoader = false) => {
        try {
            if (showLoader) setLoading(true);
            const res = await api.get(`/personal-ledger/contacts/${phone}`);
            setDetails(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [phone]);

    useEffect(() => {
        if (phone) {
            fetchDetails(true);
        }
    }, [phone, fetchDetails]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    if (!details) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
            <h2 className="text-xl font-bold">Contact not found</h2>
            <Link href="/customer/personal-ledger">
                <Button variant="link" className="mt-2">Return to Ledger</Button>
            </Link>
        </div>
    );

    const contactName = details.teammateInfo?.name || "Contact";
    const myBalance = details.myStats ? details.myStats.balance : (
        details.myEntries.reduce((acc: number, e: Entry) => e.type === 'GAVE' ? acc + Number(e.amount) : acc, 0) -
        details.myEntries.reduce((acc: number, e: Entry) => e.type === 'TOOK' ? acc + Number(e.amount) : acc, 0)
    );

    // Calculate teammate balance roughly (depends on if they are shop or customer)
    let theirBalance = 0;
    if (details.teammateInfo?.type === 'SHOP') {
        // For shops, records are Sales. Udhaar sale means I owe them (they took).
        details.teammateRecords.forEach((r) => {
            if (r.paymentType === 'UDHAAR') theirBalance -= Number(r.amount); // I owe them
            else theirBalance += Number(r.amount); // I paid them
        });
    } else if (details.teammateInfo?.type === 'CUSTOMER') {
        details.teammateRecords.forEach((r) => {
            if (r.type === 'GAVE') theirBalance -= Number(r.amount); // They say they gave me (I owe)
            else theirBalance += Number(r.amount); // They say they took from me (They owe)
        });
    }

    const isMatched = Math.abs(myBalance + theirBalance) < 0.01; // Balance should sum to 0 if matched correctly (My +100 means Their -100)

    const handleDownloadStatement = async () => {
        try {
            const res = await api.get(`/personal-ledger/contacts/${phone}/statement`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Statement-${contactName.replace(/\s+/g, '-')}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Failed to download statement", err);
        }
    };

    const handleWhatsAppShare = () => {
        const message = generateBalanceUpdateMessage(
            myBalance,
            myBalance > 0 ? 'TO_TAKE' : 'TO_GIVE'
        );
        const link = generateWhatsappLink(phone, message);
        window.open(link, '_blank');
    };

    const handleSettleUp = () => {
        const type = myBalance > 0 ? 'TOOK' : 'GAVE';
        const amount = Math.abs(myBalance).toString();

        setSettleData({ amount, type });
        setAddDialogOpen(true);
    };

    const handleAddEntry = () => {
        setSettleData(null);
        setAddDialogOpen(true);
    };

    return (
        <div className="space-y-6 pb-24 md:pb-12 min-h-screen">
            {/* Rich Hero Header Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative rounded-[2.5rem] bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#312e81] p-8 sm:p-10 overflow-hidden shadow-2xl shadow-cyan-500/10 group"
            >
                {/* Background Effects */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen opacity-50" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none mix-blend-screen" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />

                <div className="relative z-10 flex flex-col xl:flex-row xl:items-end justify-between gap-8">
                    <div className="space-y-6 flex-1">
                        {/* Custom Breadcrumbs */}
                        <div className="flex items-center gap-2 text-sm font-medium text-cyan-200/60 bg-black/20 backdrop-blur-sm w-fit px-4 py-1.5 rounded-full border border-white/5">
                            <Link href="/customer" className="hover:text-white transition-colors">Dashboard</Link>
                            <ChevronRight className="h-3 w-3 opacity-50" />
                            <Link href="/customer/personal-ledger" className="hover:text-white transition-colors">Personal Ledger</Link>
                            <ChevronRight className="h-3 w-3 opacity-50" />
                            <span className="text-white font-bold">{contactName}</span>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/10 shadow-lg">
                                    <User className="h-5 w-5 text-cyan-200" />
                                </div>
                                <span className="text-cyan-200 font-semibold tracking-wider text-sm uppercase">Contact Details</span>
                            </div>

                            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight mb-2">
                                {contactName}
                            </h1>
                            <p className="text-cyan-200/80 font-mono text-lg flex items-center gap-2">
                                <span className="bg-white/10 px-2 py-0.5 rounded-md text-base">{phone}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3 w-full xl:w-auto">
                        <Button variant="outline" className="flex-1 xl:flex-none border-white/10 bg-white/5 text-cyan-100 hover:bg-white/10 hover:text-white border-dashed h-12 rounded-xl" onClick={handleDownloadStatement}>
                            <FileText className="mr-2 h-4 w-4" />
                            Statement
                        </Button>
                        <Button variant="outline" className="flex-1 xl:flex-none bg-emerald-500/10 text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/20 hover:text-emerald-200 h-12 rounded-xl" onClick={handleWhatsAppShare}>
                            <MessageCircle className="mr-2 h-4 w-4" />
                            WhatsApp
                        </Button>
                        {Math.abs(myBalance) > 0 && (
                            <Button className="flex-1 xl:flex-none bg-cyan-600 hover:bg-cyan-500 text-white border-0 h-12 rounded-xl shadow-lg shadow-cyan-500/20" onClick={handleSettleUp}>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Settle Up
                            </Button>
                        )}
                        <Button onClick={handleAddEntry} className="flex-1 xl:flex-none bg-white text-indigo-950 hover:bg-indigo-50 font-bold px-6 shadow-xl shadow-white/5 h-12 rounded-xl min-w-[140px]">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Entry
                        </Button>
                    </div>
                </div>
            </motion.div>

            {/* Stats Cards Grid */}
            <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-3">
                <Card className={`overflow-hidden border-l-4 shadow-md ${myBalance >= 0 ? 'border-l-emerald-500 bg-gradient-to-br from-emerald-50/50 to-background' : 'border-l-rose-500 bg-gradient-to-br from-rose-50/50 to-background'}`}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                            <Wallet className="h-4 w-4 opacity-70" /> My Reported Balance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-3xl font-bold tracking-tight ${myBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {formatCurrency(Math.abs(myBalance))}
                        </div>
                        <p className={`text-sm font-medium mt-1 ${myBalance >= 0 ? 'text-emerald-600/80' : 'text-rose-600/80'}`}>
                            {myBalance > 0 ? 'You will get' : myBalance < 0 ? 'You will give' : 'Settled'}
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-muted/20 border-dashed">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                            {details.teammateInfo ? (details.teammateInfo.type === 'SHOP' ? 'Linked Shop Records' : 'Linked User Records') : 'Linked Records'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {details.teammateInfo ? (
                            <div>
                                <div className={`text-3xl font-bold tracking-tight ${theirBalance <= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {formatCurrency(Math.abs(theirBalance))}
                                </div>
                                <p className="text-sm font-medium mt-1 text-muted-foreground">
                                    {theirBalance < 0 ? 'They say: You Owe' : theirBalance > 0 ? 'They say: They Owe' : 'They say: Settled'}
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-1">
                                <div className="text-lg font-medium text-muted-foreground">Not Linked</div>
                                <div className="text-xs text-muted-foreground">
                                    This contact is not using Kirata or hasn&apos;t linked this ledger.
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className={`border-l-4 shadow-sm ${!details.teammateInfo ? 'border-l-gray-300 bg-gray-50/30' :
                    isMatched ? 'border-l-blue-500 bg-blue-50/30' : 'border-l-amber-500 bg-amber-50/30'
                    }`}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Verification Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {details.teammateInfo ? (
                            <div className={`flex items-center gap-2 font-bold text-lg ${isMatched ? 'text-blue-700' : 'text-amber-700'}`}>
                                {isMatched ? (
                                    <><CheckCircle2 className="h-5 w-5" /> Matched</>
                                ) : (
                                    <><AlertTriangle className="h-5 w-5" /> Discrepancy</>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-muted-foreground text-lg font-medium">
                                <div className="h-2 w-2 rounded-full bg-gray-400" />
                                Private
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-1 leading-snug">
                            {details.teammateInfo
                                ? isMatched ? "Your records match perfectly with theirs." : "There is a difference between your records."
                                : "This ledger is private to you."}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="my-view" className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px] h-11 p-1 bg-muted/50 rounded-full">
                    <TabsTrigger value="my-view" className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm">My Records</TabsTrigger>
                    <TabsTrigger value="their-view" disabled={!details.teammateInfo} className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm">Their Records</TabsTrigger>
                </TabsList>

                <TabsContent value="my-view" className="mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold tracking-tight">Transaction History</h2>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">{details.myEntries.length} entries</span>
                    </div>

                    <Card className="border-border/50 shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
                        <CardContent className="p-0">
                            {details.myEntries.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                                    <div className="p-4 bg-muted/50 rounded-full mb-3">
                                        <History className="h-8 w-8 opacity-50" />
                                    </div>
                                    <p>No transactions yet</p>
                                    <Button variant="link" size="sm" onClick={handleAddEntry} className="mt-1">Record your first transaction</Button>
                                </div>
                            ) : (
                                <div className="divide-y divide-border/50">
                                    {details.myEntries.map((e: Entry) => (
                                        <motion.div
                                            key={e.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex justify-between items-center p-4 hover:bg-muted/30 transition-colors group"
                                        >
                                            <div className="flex items-center gap-4 overflow-hidden">
                                                <div className={`p-2.5 rounded-full shrink-0 ${e.type === 'GAVE' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                                    {e.type === 'GAVE' ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownLeft className="h-5 w-5" />}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold truncate">
                                                        {e.type === 'GAVE' ? 'You Gave' : 'You Took'}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                                        <span>{new Date(e.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span>
                                                        <span>•</span>
                                                        <span>{new Date(e.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                    {e.notes && <p className="text-xs mt-1 text-muted-foreground italic truncate max-w-[200px] sm:max-w-xs">&quot;{e.notes}&quot;</p>}
                                                </div>
                                            </div>
                                            <div className={`text-base font-bold whitespace-nowrap pl-2 ${e.type === 'GAVE' ? 'text-rose-600' : 'text-emerald-600'}`}>
                                                {e.type === 'GAVE' ? '₹' : '₹'}{Number(e.amount).toLocaleString('en-IN')}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {details.teammateInfo && (
                    <TabsContent value="their-view" className="mt-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold tracking-tight">Their Records</h2>
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">{details.teammateRecords.length} entries</span>
                        </div>

                        <Card className="border-border/50 shadow-sm overflow-hidden bg-muted/20">
                            <CardContent className="p-0">
                                <div className="divide-y divide-border/50">
                                    {details.teammateRecords.length === 0 ? (
                                        <div className="py-12 text-center text-muted-foreground">No records found on their side.</div>
                                    ) : (
                                        details.teammateRecords.map((r, idx) => {
                                            const isPersonal = !!r.type;
                                            const amount = Number(r.amount);
                                            const isGiveFromTheirSide = isPersonal ? r.type === 'GAVE' : r.paymentType === 'UDHAAR';

                                            return (
                                                <div key={r.id || r.saleId || idx} className="flex justify-between items-center p-4 hover:bg-muted/30 transition-colors opacity-90">
                                                    <div className="flex items-center gap-4 overflow-hidden">
                                                        <div className={`p-2.5 rounded-full shrink-0 ${isGiveFromTheirSide ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                                                            {isGiveFromTheirSide ? <History className="h-5 w-5" /> : <Scale className="h-5 w-5" />}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-semibold truncate">
                                                                {isPersonal ? (isGiveFromTheirSide ? 'They Gave' : 'They Took') : (isGiveFromTheirSide ? 'They Sold Credit' : 'Payment')}
                                                            </p>
                                                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                                                <span>{new Date(r.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span>
                                                                <span>•</span>
                                                                <span>{new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                            </div>
                                                            {r.notes && <p className="text-xs mt-1 text-muted-foreground italic truncate max-w-[200px]">&quot;{r.notes}&quot;</p>}
                                                        </div>
                                                    </div>
                                                    <div className={`text-base font-bold whitespace-nowrap pl-2 ${isGiveFromTheirSide ? 'text-amber-600' : 'text-blue-600'}`}>
                                                        {isGiveFromTheirSide ? '-' : '+'}{amount.toLocaleString('en-IN')}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}
            </Tabs>

            <AddLedgerEntryDialog
                open={addDialogOpen}
                onOpenChange={setAddDialogOpen}
                onSuccess={fetchDetails}
                initialPhone={phone}
                initialName={contactName}
                initialAmount={settleData?.amount}
                initialType={settleData?.type}
            />
        </div>
    );
}
