"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trash2, UserPlus, Shield, ShieldCheck } from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

interface StaffMember {
    id: string; // ShopStaff ID
    userId: string;
    role: 'MANAGER' | 'STAFF';
    isActive: boolean;
    createdAt: string;
    user: {
        id: string;
        name: string | null;
        phone: string | null;
        email: string | null;
    };
}

export default function StaffPage() {
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newStaffPhone, setNewStaffPhone] = useState("");
    const [newStaffRole, setNewStaffRole] = useState("STAFF");
    const [submitting, setSubmitting] = useState(false);
    const { toast } = useToast();

    const fetchStaff = async () => {
        try {
            setLoading(true);
            const response = await api.get('/staff');
            setStaff(response.data.staff);
        } catch (error) {
            console.error("Failed to fetch staff:", error);
            toast({
                title: "Error",
                description: "Failed to load staff members.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleAddStaff = async () => {
        if (!newStaffPhone) return;

        try {
            setSubmitting(true);
            await api.post('/staff', {
                phone: newStaffPhone,
                role: newStaffRole
            });

            toast({
                title: "Success",
                description: "Staff member added successfully.",
            });
            setIsAddOpen(false);
            setNewStaffPhone("");
            setNewStaffRole("STAFF");
            fetchStaff();
            setNewStaffRole("STAFF");
            fetchStaff();
        } catch (error: unknown) {
            console.error("Failed to add staff:", error);
            toast({
                title: "Error",
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                description: (error as any).response?.data?.message || "Failed to add staff member.",
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleRemoveStaff = async (staffId: string) => {
        if (!confirm("Are you sure you want to remove this staff member?")) return;

        try {
            await api.delete(`/staff/${staffId}`);
            toast({
                title: "Success",
                description: "Staff member removed.",
            });
            fetchStaff();
        } catch (error: unknown) {
            console.error("Failed to remove staff:", error);
            toast({
                title: "Error",
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                description: (error as any).response?.data?.message || "Failed to remove staff member.",
                variant: "destructive",
            });
        }
    };

    const getInitials = (name?: string | null) => {
        if (!name) return "??";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
                    <p className="text-muted-foreground">Manage access to your shop.</p>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Add Staff
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Staff Member</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    placeholder="Enter user's registered phone number"
                                    value={newStaffPhone}
                                    onChange={(e) => setNewStaffPhone(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    The user must already be registered on Kirata.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <Select value={newStaffRole} onValueChange={setNewStaffRole}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="STAFF">Staff (Sales & Ledger)</SelectItem>
                                        <SelectItem value="MANAGER">Manager (Full Access except Settings)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                            <Button onClick={handleAddStaff} disabled={submitting || !newStaffPhone}>
                                {submitting ? "Adding..." : "Add Staff"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Current Staff</CardTitle>
                    <CardDescription>
                        List of users with access to this shop.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8">Loading...</div>
                    ) : staff.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No staff members found. Add someone to get started.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Added On</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {staff.map((member) => (
                                    <TableRow key={member.id}>
                                        <TableCell className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarFallback>{getInitials(member.user.name)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{member.user.name || "Unknown"}</div>
                                                <div className="text-sm text-muted-foreground">{member.user.phone}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={member.role === 'MANAGER' ? 'default' : 'secondary'}>
                                                {member.role === 'MANAGER' ? <ShieldCheck className="h-3 w-3 mr-1" /> : <Shield className="h-3 w-3 mr-1" />}
                                                {member.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(member.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => handleRemoveStaff(member.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
