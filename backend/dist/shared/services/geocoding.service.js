"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDistance = exports.reverseGeocode = exports.geocodeAddress = void 0;
const google_maps_services_js_1 = require("@googlemaps/google-maps-services-js");
const logger_1 = require("../utils/logger");
const client = new google_maps_services_js_1.Client({});
/**
 * Geocode an address to get GPS coordinates
 */
const geocodeAddress = async (addressLine1, city, state, pincode) => {
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
            logger_1.logger.info(`Geocoded address: ${address} -> ${location.lat}, ${location.lng}`);
            return {
                latitude: location.lat,
                longitude: location.lng,
                formattedAddress: result.formatted_address
            };
        }
        logger_1.logger.warn(`No geocoding results for address: ${address}`);
        return null;
    }
    catch (error) {
        logger_1.logger.error('Geocoding failed:', error);
        return null;
    }
};
exports.geocodeAddress = geocodeAddress;
/**
 * Reverse geocode coordinates to get address
 */
const reverseGeocode = async (latitude, longitude) => {
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
    }
    catch (error) {
        logger_1.logger.error('Reverse geocoding failed:', error);
        return null;
    }
};
exports.reverseGeocode = reverseGeocode;
/**
 * Calculate distance between two coordinates (Haversine formula)
 * Returns distance in kilometers
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return Math.round(distance * 100) / 100; // Round to 2 decimal places
};
exports.calculateDistance = calculateDistance;
function toRad(degrees) {
    return degrees * (Math.PI / 180);
}
