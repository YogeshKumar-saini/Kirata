import api from '@/lib/api';

export interface Shop {
    photoUrl: string | undefined;
    shopId: string;
    ownerId: string;
    name: string;
    description?: string;
    category?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    pincode?: string;
    phone?: string;
    alternatePhone?: string;
    email?: string;
    whatsappNumber?: string;
    gstNumber?: string;
    logoUrl?: string;
    vacationMode?: boolean;
    vacationMessage?: string;
    businessHours?: Record<string, { open: string; close: string; closed: boolean }>;
    isActive: boolean;
    isProfileComplete?: boolean;
}

export const shopService = {
    // Get My Shop
    getMyShop: async (): Promise<Shop> => {
        const response = await api.get('/shops/my');
        // If the backend returns { shop: ... } or just the shop object, handle it.
        // Based on typical patterns in this project, it might be the data directly or wrapped.
        // Assuming direct return or { shop } wrapper. Adjust as needed after testing.
        return response.data;
    },

    // Update Shop Details
    updateShop: async (data: Partial<Shop>) => {
        const response = await api.patch('/shops/my', data);
        return response.data;
    },

    // Upload Logo
    uploadLogo: async (file: File) => {
        const formData = new FormData();
        formData.append('logo', file);
        const response = await api.post('/media/logo', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data; // Should return { url: '...' }
    },

    // Toggle Vacation Mode
    enableVacationMode: async (message?: string) => {
        const response = await api.post('/shops/my/vacation', { message });
        return response.data;
    },

    disableVacationMode: async () => {
        const response = await api.delete('/shops/my/vacation');
        return response.data;
    },

    // Business Hours
    updateBusinessHours: async (hours: Record<string, unknown>) => {
        const response = await api.patch('/shops/my', { businessHours: hours });
        return response.data;
    },

    // Delete Shop (Soft Delete)
    deleteShop: async () => {
        const response = await api.delete('/shops/my');
        return response.data;
    }
};
