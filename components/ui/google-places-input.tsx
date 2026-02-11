'use client';

import React, { useEffect, useState } from 'react';
import usePlacesAutocomplete from 'use-places-autocomplete';
import { MapPin, Loader2 } from 'lucide-react';

interface GooglePlacesInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

export function GooglePlacesInput({
    value,
    onChange,
    placeholder = "City/Location",
    disabled = false
}: GooglePlacesInputProps) {
    const {
        ready,
        value: searchValue,
        suggestions: { status, data },
        setValue,
        clearSuggestions,
        init,
    } = usePlacesAutocomplete({
        initOnMount: false,
        debounce: 300,
        defaultValue: value,
    });

    const [scriptLoaded, setScriptLoaded] = useState(false);

    // Initialize when Google Maps script is available
    useEffect(() => {
        const checkGoogleMaps = () => {
            if (window.google && window.google.maps && window.google.maps.places) {
                init();
                setScriptLoaded(true);
                return true;
            }
            return false;
        };

        if (!checkGoogleMaps()) {
            const interval = setInterval(() => {
                if (checkGoogleMaps()) {
                    clearInterval(interval);
                }
            }, 100);
            return () => clearInterval(interval);
        }
    }, [init]);

    // Keep internal state in sync with external value prop
    useEffect(() => {
        // Only update if the external value is different and we're not currently typing
        // to avoid conflicts. However, for a controlled input like this, we usually just sync.
        if (value !== searchValue) {
            setValue(value, false);
        }
    }, [value, setValue, searchValue]);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
        onChange(e.target.value);
    };

    const handleSelect = (description: string) => {
        setValue(description, false);
        onChange(description);
        clearSuggestions();
    };

    return (
        <div className="relative group w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-sky-500 transition-colors">
                <MapPin size={14} />
            </div>
            <input
                value={searchValue}
                onChange={handleInput}
                disabled={!ready || disabled}
                placeholder={placeholder}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg py-2.5 pl-9 pr-3 text-xs font-medium focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
                autoComplete="off"
            />

            {!ready && !scriptLoaded && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                    <Loader2 size={12} className="animate-spin" />
                </div>
            )}

            {status === "OK" && (
                <ul className="absolute z-50 w-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto overflow-x-hidden text-left custom-scrollbar">
                    {data.map(({ place_id, description, structured_formatting }) => (
                        <li
                            key={place_id}
                            onClick={() => handleSelect(description)}
                            className="px-3 py-2 hover:bg-sky-50 cursor-pointer flex items-start gap-2 text-xs text-slate-700 transition-colors border-b border-slate-50 last:border-0"
                        >
                            <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                            <div className="flex flex-col">
                                <span className="font-medium text-slate-800">
                                    {structured_formatting.main_text}
                                </span>
                                <span className="text-[10px] text-slate-500">
                                    {structured_formatting.secondary_text}
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
