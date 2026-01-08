'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Download, Upload, AlertTriangle, Database, Shield, Loader2, FileJson, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function BackupPage() {
    const [loading, setLoading] = useState(false);
    const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [pin, setPin] = useState('');
    const { toast } = useToast();

    const handleExportBackup = async () => {
        try {
            setLoading(true);

            const response = await api.get('/backup/export', {
                responseType: 'blob'
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `kirata-backup-${new Date().toISOString().split('T')[0]}.json`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast({
                title: 'Success',
                description: 'Backup downloaded successfully'
            });
        } catch (error: unknown) {
            console.error(error);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const err = error as any;
            toast({
                title: 'Error',
                description: err.response?.data?.message || 'Failed to export backup',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
                toast({
                    title: 'Invalid File',
                    description: 'Please select a valid JSON backup file',
                    variant: 'destructive'
                });
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleRestoreBackup = async () => {
        if (!selectedFile || !pin) {
            toast({
                title: 'Missing Information',
                description: 'Please select a file and enter your PIN',
                variant: 'destructive'
            });
            return;
        }

        try {
            setLoading(true);

            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('pin', pin);

            await api.post('/backup/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            toast({
                title: 'Success',
                description: 'Backup restored successfully. Please refresh the page.'
            });

            setRestoreDialogOpen(false);
            setSelectedFile(null);
            setPin('');
        } catch (error: unknown) {
            console.error(error);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const err = error as any;
            toast({
                title: 'Error',
                description: err.response?.data?.error || 'Failed to restore backup',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-8 p-1 pb-20">
            {/* Hero Section */}
            <div className="flex flex-col gap-6">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                >
                    <h1 className="text-3xl md:text-5xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/50 dark:from-white dark:to-white/50">
                        Backup & Restore
                    </h1>
                    <p className="text-muted-foreground/80 text-base md:text-lg">
                        Protect your data with secure backups and easy restoration.
                    </p>
                </motion.div>

                {/* Warning Alert */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Alert className="border-amber-500/50 bg-amber-500/10">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        <AlertDescription className="text-sm">
                            <strong>Important:</strong> Restoring a backup will replace all current data.
                            Always export a current backup before restoring an old one.
                        </AlertDescription>
                    </Alert>
                </motion.div>
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Export Backup Card */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="border-border/50 shadow-lg bg-card/40 backdrop-blur-sm h-full">
                        <CardHeader className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-b border-blue-500/10">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                                    <Download className="h-6 w-6 text-blue-500" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl">Export Backup</CardTitle>
                                    <CardDescription>Download your data as a JSON file</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            <div className="space-y-4">
                                <div className="flex items-start gap-3 text-sm">
                                    <Database className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-medium">Complete Data Export</p>
                                        <p className="text-muted-foreground text-xs">
                                            Includes products, customers, orders, ledger, and all shop data
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 text-sm">
                                    <FileJson className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-medium">JSON Format</p>
                                        <p className="text-muted-foreground text-xs">
                                            Human-readable format that can be viewed and edited
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 text-sm">
                                    <Calendar className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-medium">Timestamped</p>
                                        <p className="text-muted-foreground text-xs">
                                            File name includes today&apos;s date for easy organization
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={handleExportBackup}
                                disabled={loading}
                                className="w-full h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg shadow-blue-500/20"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Exporting...
                                    </>
                                ) : (
                                    <>
                                        <Download className="mr-2 h-5 w-5" />
                                        Export Backup
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Import Backup Card */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="border-border/50 shadow-lg bg-card/40 backdrop-blur-sm h-full">
                        <CardHeader className="bg-gradient-to-r from-rose-500/10 to-orange-500/10 border-b border-rose-500/10">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-2xl bg-rose-500/10 flex items-center justify-center">
                                    <Upload className="h-6 w-6 text-rose-500" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl">Restore Backup</CardTitle>
                                    <CardDescription>Upload a backup file to restore data</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            <div className="space-y-4">
                                <div className="flex items-start gap-3 text-sm">
                                    <Shield className="h-5 w-5 text-rose-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-medium">PIN Protected</p>
                                        <p className="text-muted-foreground text-xs">
                                            Requires your security PIN to prevent unauthorized restores
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 text-sm">
                                    <AlertTriangle className="h-5 w-5 text-rose-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-medium">Replaces Current Data</p>
                                        <p className="text-muted-foreground text-xs">
                                            All existing data will be replaced with backup data
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 text-sm">
                                    <Database className="h-5 w-5 text-rose-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-medium">Complete Restoration</p>
                                        <p className="text-muted-foreground text-xs">
                                            Restores all products, customers, orders, and transactions
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={() => setRestoreDialogOpen(true)}
                                variant="outline"
                                className="w-full h-12 rounded-2xl border-rose-500/30 hover:bg-rose-500/10 hover:border-rose-500/50"
                            >
                                <Upload className="mr-2 h-5 w-5 text-rose-500" />
                                Restore Backup
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Best Practices Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <Card className="border-border/50 shadow-lg bg-card/40 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Best Practices</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                <span><strong>Regular Backups:</strong> Export backups weekly or after major data changes</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                <span><strong>Safe Storage:</strong> Store backup files in multiple secure locations (cloud, external drive)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                <span><strong>Before Restore:</strong> Always export a current backup before restoring an old one</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                <span><strong>File Naming:</strong> Keep backup files organized with dates in their names</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                <span><strong>Test Restores:</strong> Periodically test your backup files to ensure they work</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Restore Dialog */}
            <Dialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-rose-500" />
                            Restore Backup
                        </DialogTitle>
                        <DialogDescription>
                            This will replace all current data with the backup. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="backup-file">Backup File</Label>
                            <Input
                                id="backup-file"
                                type="file"
                                accept=".json,application/json"
                                onChange={handleFileSelect}
                                disabled={loading}
                                className="cursor-pointer"
                            />
                            {selectedFile && (
                                <p className="text-xs text-muted-foreground">
                                    Selected: {selectedFile.name}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="pin">Security PIN</Label>
                            <Input
                                id="pin"
                                type="password"
                                placeholder="Enter your 4-digit PIN"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                disabled={loading}
                                maxLength={4}
                                className="bg-card/40 border-white/10"
                            />
                            <p className="text-xs text-muted-foreground">
                                Your PIN is required to authorize this critical operation
                            </p>
                        </div>

                        <Alert className="border-rose-500/50 bg-rose-500/10">
                            <AlertTriangle className="h-4 w-4 text-rose-500" />
                            <AlertDescription className="text-xs">
                                Make sure you have exported a current backup before proceeding.
                                All existing data will be permanently replaced.
                            </AlertDescription>
                        </Alert>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setRestoreDialogOpen(false);
                                setSelectedFile(null);
                                setPin('');
                            }}
                            disabled={loading}
                            className="border-white/10"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleRestoreBackup}
                            disabled={loading || !selectedFile || !pin}
                            className="bg-rose-500 hover:bg-rose-600"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Restoring...
                                </>
                            ) : (
                                <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Restore Backup
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
