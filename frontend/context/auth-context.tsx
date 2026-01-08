"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '@/lib/api';
import { Shop } from '@/services/shop-service';
import { useRouter } from 'next/navigation';

export interface NotificationPrefs {
    orderUpdates?: { email?: boolean; sms?: boolean; whatsapp?: boolean };
    promotionalOffers?: { email?: boolean; push?: boolean };
    securityAlerts?: { email?: boolean; sms?: boolean };
}

interface User {
    id: string;
    name?: string;
    email?: string;
    phone?: string;
    role: string;
    address?: string; // Legacy/Summary
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    pincode?: string;
    photoUrl?: string;
    notificationPrefs?: NotificationPrefs;
    gender?: string;
    dateOfBirth?: string;
    hasCompletedShopSetup?: boolean;
    emailVerified?: boolean;
    shops?: Shop[]; // Added shops array
    password?: string; // Present determines if password is set
}

interface LoginCredentials {
    email?: string;
    phone?: string;
    password?: string;
    otp?: string;
}

interface RegisterData {
    name?: string;
    email?: string;
    phone?: string;
    role: 'SHOPKEEPER' | 'CUSTOMER';
}

interface Session {
    id: string;
    deviceInfo?: string;
    ipAddress?: string;
    lastActive: string;
    isCurrent?: boolean;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    loginWithGoogle: (token: string) => Promise<void>; // New
    register: (data: RegisterData) => Promise<void>;
    registerWithGoogle: (data: { role: 'SHOPKEEPER' | 'CUSTOMER', token: string }) => Promise<void>; // New
    requestOtp: (identifier: { phone?: string, email?: string }) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    refreshProfile: () => Promise<void>;

    // Password Reset / Update
    requestPasswordReset: (identifier: { phone?: string, email?: string }) => Promise<void>;
    confirmPasswordReset: (identifier: { phone?: string, email?: string }, otp: string, newPassword: string) => Promise<void>;
    updatePassword: (data: { currentPassword?: string, newPassword: string }) => Promise<void>;

    // Email Verification
    sendEmailVerification: () => Promise<void>;
    verifyEmail: (otp: string) => Promise<void>;

    // Change Email/Phone
    requestEmailChange: (newEmail: string) => Promise<void>;
    confirmEmailChange: (newEmail: string, otp: string) => Promise<void>;
    requestPhoneChange: (newPhone: string) => Promise<void>;
    confirmPhoneChange: (newPhone: string, otp: string) => Promise<void>;

    // Session Management
    listSessions: () => Promise<Session[]>;
    revokeSession: (sessionId: string) => Promise<void>;
    revokeAllSessions: () => Promise<void>;

    // Transaction PIN (Shopkeeper)
    setTransactionPin: (pin: string) => Promise<void>;
    verifyTransactionPin: (pin: string) => Promise<boolean>;

    // Account Management
    updateProfile: (data: {
        name?: string,
        address?: string,
        addressLine1?: string,
        addressLine2?: string,
        city?: string,
        state?: string,
        pincode?: string,
        photoUrl?: string,
        notificationPrefs?: NotificationPrefs,
        gender?: string,
        dateOfBirth?: string
    }) => Promise<void>;
    deactivateAccount: () => Promise<void>;
    reactivateAccount: () => Promise<void>;
    redirectBasedOnRole: (role: string, hasCompletedShopSetup?: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();


    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                // Fetch user profile
                const response = await api.get('/me');
                // Backend returns { role, profile }. Profile for shopkeeper has hasCompletedShopSetup.
                const profile = response.data.profile;
                const role = response.data.role;
                setUser({ ...profile, role });
            }
        } catch (error) {
            console.error('Auth check failed', error);
            localStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    };

    const refreshProfile = async () => {
        await checkAuth();
    }


    const redirectBasedOnRole = (role: string, hasCompletedShopSetup?: boolean) => {
        switch (role) {
            case 'SUPER_ADMIN':
            case 'SHOP_MANAGER_ADMIN':
            case 'SUPPORT_ADMIN':
                router.push('/admin');
                break;
            case 'SHOPKEEPER':
                if (hasCompletedShopSetup) {
                    router.push('/shop');
                } else {
                    router.push('/shop/setup');
                }
                break;
            case 'CUSTOMER':
                router.push('/customer');
                break;
            default:
                router.push('/');
        }
    };

    const login = async (credentials: LoginCredentials) => {
        const response = await api.post('/auth/login', credentials);
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        setUser(user);
        setUser(user);
        // Redirect based on role instead of welcome
        redirectBasedOnRole(user.role, user.shops && user.shops.length > 0);
    };

    const loginWithGoogle = async (token: string) => {
        console.log('Sending Google token to backend...');
        const response = await api.post('/auth/google', { token });
        console.log('Backend response:', response.data);
        const data = response.data;

        if (data.status === 'ROLE_REQUIRED') {
            // Special case: We need to ask the user for their role
            // We can throw a specific error with data attached, or return it.
            // Since this function returns void, throwing is safer to catch in component.
            const error = new Error('ROLE_REQUIRED') as Error & { response?: { data: typeof data } };
            error.response = { data }; // Mimic axios error structure
            throw error;
        }

        const { token: authToken, user, role } = data;
        localStorage.setItem('token', authToken);
        const userWithRole = { ...user, role };
        setUser(userWithRole);
        // Redirect to welcome page for animation
        router.push('/welcome');
    };

    const registerWithGoogle = async (data: { role: 'SHOPKEEPER' | 'CUSTOMER', token: string }) => {
        const response = await api.post('/auth/google/register', data);
        const { token: authToken, user, role } = response.data;
        localStorage.setItem('token', authToken);
        const userWithRole = { ...user, role };
        setUser(userWithRole);
        redirectBasedOnRole(role, user.shops && user.shops.length > 0);
        // Redirect to welcome page for animation
        router.push('/welcome');
    };

    const register = async (data: RegisterData) => {
        const endpoint = data.role === 'SHOPKEEPER' ? '/shopkeeper/register' : '/customer/register';
        // Note: Backend reg returns { message, uniqueId }, NO token.
        await api.post(endpoint, {
            name: data.name,
            email: data.email,
            phone: data.phone
        });
        // Do not setUser or redirect yet. The Page must handle the next step (OTP Verification).
    };

    const requestOtp = async (identifier: { phone?: string, email?: string }) => {
        await api.post('/auth/otp', identifier);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        // Redirect to see-you-soon page instead of login directly
        router.push('/see-you-soon');
    };

    // Password Reset
    const requestPasswordReset = async (identifier: { phone?: string, email?: string }) => {
        await api.post('/auth/password/reset-request', identifier);
    };

    const confirmPasswordReset = async (identifier: { phone?: string, email?: string }, otp: string, newPassword: string) => {
        await api.post('/auth/password/reset-confirm', {
            ...identifier,
            otp,
            newPassword
        });
    };

    const updatePassword = async (data: { currentPassword?: string, newPassword: string }) => {
        await api.patch('/me/password', data);
        await refreshProfile();
    };

    // Email Verification
    const sendEmailVerification = async () => {
        await api.post('/me/verify-email/send');
    };

    const verifyEmail = async (otp: string) => {
        await api.post('/me/verify-email/confirm', { otp });
        await refreshProfile(); // Refresh to get updated email verification status
    };

    // Change Email/Phone
    const requestEmailChange = async (newEmail: string) => {
        await api.post('/me/change-email/request', { newEmail });
    };

    const confirmEmailChange = async (newEmail: string, otp: string) => {
        await api.post('/me/change-email/confirm', { newEmail, otp });
        await refreshProfile(); // Refresh to get updated email
    };

    const requestPhoneChange = async (newPhone: string) => {
        await api.post('/me/change-phone/request', { newPhone });
    };

    const confirmPhoneChange = async (newPhone: string, otp: string) => {
        await api.post('/me/change-phone/confirm', { newPhone, otp });
        await refreshProfile(); // Refresh to get updated phone
    };

    // Session Management
    const listSessions = async (): Promise<Session[]> => {
        const response = await api.get('/sessions');
        return response.data;
    };

    const revokeSession = async (sessionId: string) => {
        await api.delete(`/sessions/${sessionId}`);
    };

    const revokeAllSessions = async () => {
        await api.delete('/sessions');
        // After revoking all sessions, log out the user
        logout();
    };

    // Transaction PIN (Shopkeeper)
    const setTransactionPin = async (pin: string) => {
        await api.post('/me/pin/set', { pin });
    };

    const verifyTransactionPin = async (pin: string): Promise<boolean> => {
        const response = await api.post('/me/pin/verify', { pin });
        return response.data.isValid;
    };

    // Account Management
    const updateProfile = async (data: {
        name?: string,
        address?: string,
        addressLine1?: string,
        addressLine2?: string,
        city?: string,
        state?: string,
        pincode?: string,
        photoUrl?: string,
        notificationPrefs?: NotificationPrefs,
        gender?: string,
        dateOfBirth?: string
    }) => {
        await api.put('/me', data);
        await refreshProfile(); // Refresh to get updated profile
    };

    const deactivateAccount = async () => {
        await api.delete('/me');
        logout(); // Log out after deactivation
    };

    const reactivateAccount = async () => {
        await api.post('/me/reactivate');
        await refreshProfile();
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            loginWithGoogle,
            register,
            registerWithGoogle,
            requestOtp,
            logout,
            isAuthenticated: !!user,
            refreshProfile,

            requestPasswordReset,
            confirmPasswordReset,
            updatePassword,
            sendEmailVerification,
            verifyEmail,
            requestEmailChange,
            confirmEmailChange,
            requestPhoneChange,
            confirmPhoneChange,
            listSessions,
            revokeSession,
            revokeAllSessions,
            setTransactionPin,
            verifyTransactionPin,
            updateProfile,
            deactivateAccount,
            reactivateAccount,
            redirectBasedOnRole, // Exposed
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export type { Session, User };
