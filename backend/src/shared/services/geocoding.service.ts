import { Client } from '@googlemaps/google-maps-services-js';
import { logger } from '../utils/logger';

const client = new Client({});

export interface GeocodedLocation {
    latitude: number;
    longitude: number;
    formattedAddress?: string;
}

/**
 * Geocode an address to get GPS coordinates
 */
export const geocodeAddress = async (
    addressLine1: string,
    city: string,
    state: string,
    pincode: string
): Promise<GeocodedLocation | null> => {
    const address = `${addressLine1}, ${city}, ${state} ${pincode}, India`;

    try {
        const response = await client.geocode({
            params: {
                address,
                key: process.env.GOOGLE_MAPS_API_KEY || ''
            }
        });

        if (response.data.results.length > 0) {
            const result = response.data.results[0];
            const location = result.geometry.location;

            logger.info(`Geocoded address: ${address} -> ${location.lat}, ${location.lng}`);

            return {
                latitude: location.lat,
                longitude: location.lng,
                formattedAddress: result.formatted_address
            };
        }

        logger.warn(`No geocoding results for address: ${address}`);
        return null;
    } catch (error) {
        logger.error('Geocoding failed:', error);
        return null;
    }
};

/**
 * Reverse geocode coordinates to get address
 */
export const reverseGeocode = async (
    latitude: number,
    longitude: number
): Promise<string | null> => {
    try {
        const response = await client.reverseGeocode({
            params: {
                latlng: { lat: latitude, lng: longitude },
                key: process.env.GOOGLE_MAPS_API_KEY || ''
            }
        });

        if (response.data.results.length > 0) {
            return response.data.results[0].formatted_address;
        }

        return null;
    } catch (error) {
        logger.error('Reverse geocoding failed:', error);
        return null;
    }
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 * Returns distance in kilometers
 */
export const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number => {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

function toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
}
