"use client";

import React from 'react';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';

export default function AdminDashboard() {
    const { user, logout } = useAuth();

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
            <p className="mb-4">Welcome, {user?.name || 'Admin'}!</p>
            <Button onClick={logout}>Logout</Button>
        </div>
    );
}
