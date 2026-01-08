
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Upload, AlertTriangle, Loader2, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import api from "@/lib/api";
import { PinDialog } from "@/components/security/pin-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

export function BackupManager() {
    const [loading, setLoading] = useState(false);
    const [importLoading, setImportLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [pinDialogOpen, setPinDialogOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [restoreConfirmOpen, setRestoreConfirmOpen] = useState(false);

    const handleExport = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/backup/export', {
                responseType: 'blob'
            });

            // Trigger download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const dateStr = new Date().toISOString().split('T')[0];
            link.setAttribute('download', `kirata-backup-${dateStr}.json`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            setSuccess("Backup downloaded successfully.");
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error('Export failed:', err);
            const msg = err?.response?.data?.error || "Failed to download backup.";
            setError(msg);
        } finally {
            setLoading(false);
            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(null), 3000);
        }
    };

    const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
            setRestoreConfirmOpen(true);
        }
    };

    const handleRestoreConfirm = () => {
        setRestoreConfirmOpen(false);
        setPinDialogOpen(true);
    };

    const handleRestore = async (pin: string) => {
        if (!selectedFile) return;

        setImportLoading(true);
        setError(null);
        setSuccess(null);
        setPinDialogOpen(false); // Close PIN dialog

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            await api.post('/backup/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'x-transaction-pin': pin
                }
            });

            setSuccess("Backup restored successfully. Reloading page...");
            setTimeout(() => {
                window.location.reload();
            }, 2000);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error('Restore failed:', err);
            const msg = err?.response?.data?.error || "Failed to restore backup. Invalid file or PIN.";
            setError(msg);
            setImportLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>Backup and restore your shop data.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* Export Section */}
                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                    <div className="space-y-1">
                        <h4 className="font-medium flex items-center gap-2">
                            <Download className="h-4 w-4" />
                            Export Data
                        </h4>
                        <p className="text-sm text-muted-foreground">
                            Download a JSON backup of all your customers, sales, and products.
                        </p>
                    </div>
                    <Button onClick={handleExport} disabled={loading || importLoading} variant="outline">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Download JSON
                    </Button>
                </div>

                {/* Import Section */}
                <div className="flex items-center justify-between p-4 border rounded-lg border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-900/30">
                    <div className="space-y-1">
                        <h4 className="font-medium flex items-center gap-2 text-yellow-800 dark:text-yellow-500">
                            <Upload className="h-4 w-4" />
                            Restore from Backup
                        </h4>
                        <p className="text-sm text-yellow-700/80 dark:text-yellow-500/80">
                            Restoring will <strong>replace</strong> your current data with the backup.
                        </p>
                    </div>
                    <div className="relative">
                        <input
                            type="file"
                            accept=".json"
                            onChange={onFileSelected}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            disabled={loading || importLoading}
                        />
                        <Button variant="destructive" disabled={loading || importLoading}>
                            {importLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Restore Data"}
                        </Button>
                    </div>
                </div>

                {error && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {success && (
                    <Alert className="border-green-200 bg-green-50 dark:bg-green-900/10 dark:text-green-400">
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <AlertTitle>Success</AlertTitle>
                        <AlertDescription>{success}</AlertDescription>
                    </Alert>
                )}

                {/* Restore Confirmation Dialog */}
                <Dialog open={restoreConfirmOpen} onOpenChange={setRestoreConfirmOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Restore Data?</DialogTitle>
                            <DialogDescription>
                                This action is <strong>destructive</strong>. It will delete your current customers, sales, and products and replace them with the data from the backup file.
                                <br /><br />
                                Are you sure you want to proceed?
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setRestoreConfirmOpen(false)}>Cancel</Button>
                            <Button variant="destructive" onClick={handleRestoreConfirm}>Proceed to PIN</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* PIN Dialog */}
                <PinDialog
                    open={pinDialogOpen}
                    onOpenChange={setPinDialogOpen}
                    onSuccess={handleRestore}
                    title="Enter PIN to Restore"
                    description="This is a high-security action. verifying your identity."
                />
            </CardContent>
        </Card>
    );
}
