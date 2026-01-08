'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Loader2, Upload, AlertCircle, CheckCircle2, FileUp } from "lucide-react";
import api from "@/lib/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";

interface BulkUploadDialogProps {
    onSuccess: () => void;
}

export function BulkUploadDialog({ onSuccess }: BulkUploadDialogProps) {
    const [open, setOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<{ success: number; failed: number } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
            setResult(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        try {
            setUploading(true);
            setError(null);

            const formData = new FormData();
            formData.append('file', file);

            const response = await api.post('/products/bulk-upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log("Upload result:", response.data);
            setResult(response.data.details);
            onSuccess();
        } catch (err) {
            console.error('Upload failed:', err);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const message = (err as any).response?.data?.message || 'Failed to upload CSV';
            setError(message);
        } finally {
            setUploading(false);
        }
    };

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (!newOpen) {
            // Reset state when closed
            setFile(null);
            setResult(null);
            setError(null);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" className="bg-background/50 backdrop-blur-sm border-dashed">
                    <Upload className="mr-2 h-4 w-4" />
                    Import CSV
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] glass border-sidebar-border/50">
                <DialogHeader>
                    <DialogTitle>Bulk Upload Products</DialogTitle>
                    <DialogDescription>
                        Upload a CSV file to add products in bulk.
                        <br />
                        <span className="text-xs text-muted-foreground mt-1 block">
                            Required columns: <code>name</code>, <code>price</code>, <code>stock</code>
                        </span>
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors relative">
                        <div className="absolute inset-0 cursor-pointer opacity-0">
                            <Input id="csv-file" type="file" accept=".csv" className="w-full h-full cursor-pointer" onChange={handleFileChange} />
                        </div>
                        <FileUp className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
                        <p className="text-sm font-medium text-center">
                            {file ? (
                                <span className="text-primary">{file.name}</span>
                            ) : (
                                "Drag & drop or click to select CSV"
                            )}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Max file size: 5MB
                        </p>
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                                <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            </motion.div>
                        )}

                        {result && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                                <Alert className="bg-green-500/10 text-green-600 border-green-500/20">
                                    <CheckCircle2 className="h-4 w-4" />
                                    <AlertTitle>Upload processed</AlertTitle>
                                    <AlertDescription>
                                        <div className="flex justify-between items-center mt-1">
                                            <span>Added: {result.success}</span>
                                            <span>Failed: {result.failed}</span>
                                        </div>
                                    </AlertDescription>
                                </Alert>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setOpen(false)}>Close</Button>
                    <Button onClick={handleUpload} disabled={!file || uploading} className="shadow-lg shadow-primary/20">
                        {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Upload
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
