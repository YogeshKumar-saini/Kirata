'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Input } from "@/components/ui/input";
import { Search, MapPin, Loader2, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AddressSuggestion {
    display_name: string;
    address: {
        municipality: string | undefined;
        path: string | undefined;
        building: string | undefined;
        subdistrict: string | undefined;
        neighbourhood: string | undefined;
        pedestrian: string | undefined;
        road?: string;
        suburb?: string;
        city?: string;
        town?: string;
        village?: string;
        state?: string;
        postcode?: string;
        country?: string;
    };
    lat: string;
    lon: string;
}

interface AddressSearchProps {
    onSelect: (address: {
        line1: string;
        city: string;
        state: string;
        pincode: string;
    }) => void;
}

export function AddressSearch({ onSelect }: AddressSearchProps) {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const fetchSuggestions = useCallback(async (searchQuery: string) => {
        if (searchQuery.length < 3) {
            setSuggestions([]);
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&addressdetails=1&limit=8`,
                {
                    headers: {
                        'Accept-Language': 'en',
                        'User-Agent': 'Kirata-App-Address-Search (yksaini0192@gmail.com)'
                    }
                }
            );
            const data = await response.json();

            // Deduplicate by display_name
            const seen = new Set();
            const uniqueData = data.filter((item: AddressSuggestion) => {
                const isDuplicate = seen.has(item.display_name);
                seen.add(item.display_name);
                return !isDuplicate;
            });

            setSuggestions(uniqueData);
            setIsOpen(true);
        } catch (error) {
            console.error('Failed to fetch address suggestions:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (query && query.length >= 3) fetchSuggestions(query);
        }, 500);

        return () => clearTimeout(timer);
    }, [query, fetchSuggestions]);

    const handleSelect = (suggestion: AddressSuggestion) => {
        const addr = suggestion.address;

        const city = addr.city || addr.town || addr.village || addr.municipality || '';
        const state = addr.state || '';
        const pincode = addr.postcode || '';

        // Construct line1 carefully to avoid duplicating the city/state
        const road = addr.road || addr.pedestrian || addr.path || addr.building || '';
        const suburb = addr.suburb || addr.neighbourhood || addr.subdistrict || '';

        let line1 = [road, suburb].filter(Boolean).join(', ').trim();

        // If line1 is still empty or too short, use the first part of display_name 
        // that isn't the city or state
        if (!line1 || line1.toLowerCase() === city.toLowerCase()) {
            const parts = suggestion.display_name.split(',');
            // Take up to first 2 parts if they aren't duplicates
            const filteredParts = parts.filter(p => {
                const trimmed = p.trim().toLowerCase();
                return trimmed !== city.toLowerCase() &&
                    trimmed !== state.toLowerCase() &&
                    trimmed !== 'india';
            });
            line1 = filteredParts.slice(0, 2).join(', ').trim() || parts[0].trim();
        }

        onSelect({
            line1,
            city,
            state,
            pincode,
        });

        setQuery(suggestion.display_name);
        setSuggestions([]);
        setIsOpen(false);
    };

    return (
        <div className="relative w-full group">
            <div className="relative transition-all duration-300">
                <Search className={`absolute left-3 top-2.5 h-4 w-4 transition-colors duration-300 ${isLoading ? 'text-primary' : 'text-muted-foreground'}`} />
                <Input
                    placeholder="Search your shop location..."
                    className="pl-9 bg-white/5 border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 backdrop-blur-md transition-all duration-300 group-hover:bg-white/10"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        if (e.target.value.length < 3) {
                            setSuggestions([]);
                            setIsOpen(false);
                        }
                    }}
                    onFocus={() => query.length >= 3 && setIsOpen(true)}
                />
                <AnimatePresence>
                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="absolute right-3 top-2.5"
                        >
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {isOpen && suggestions.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 5, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.98 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute z-50 w-full mt-2 bg-slate-900/40 border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] max-h-80 overflow-hidden backdrop-blur-2xl ring-1 ring-white/5"
                    >
                        <div className="p-2 border-b border-white/5 bg-white/5 flex items-center justify-between">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 ml-2">Suggestions</span>
                            <div className="flex items-center gap-1 text-[10px] text-slate-500 mr-2 uppercase tracking-wide">
                                <Globe className="h-2.5 w-2.5" />
                                <span>Global Search</span>
                            </div>
                        </div>
                        <ul className="overflow-auto max-h-64 scrollbar-hide py-1">
                            {suggestions.map((suggestion, index) => (
                                <motion.li
                                    key={index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    onClick={() => handleSelect(suggestion)}
                                    className="flex items-start gap-3 p-3 mx-1 rounded-xl hover:bg-primary/10 hover:translate-x-1 cursor-pointer transition-all border border-transparent hover:border-primary/20 active:scale-[0.98]"
                                >
                                    <div className="h-8 w-8 bg-white/5 rounded-lg flex items-center justify-center shrink-0 border border-white/5">
                                        <MapPin className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-sm font-medium text-slate-100 truncate tracking-tight">
                                            {suggestion.display_name.split(',')[0]}
                                        </span>
                                        <span className="text-xs text-slate-400 truncate leading-relaxed">
                                            {suggestion.display_name.split(',').slice(1).join(',').trim()}
                                        </span>
                                    </div>
                                </motion.li>
                            ))}
                        </ul>
                        <div className="p-2 border-t border-white/10 bg-black/20 text-center">
                            <span className="text-[9px] text-slate-600 uppercase tracking-widest font-medium">Powered by OpenStreetMap</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
