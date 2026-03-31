/**
 * TherapistFilter Component
 * Advanced filter panel for finding therapists
 * Includes specialization, languages, service type, mode, and availability filters
 */

import { useState } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ==========================================
// Filter Options
// ==========================================

export const SPECIALIZATIONS = [
    'ADHD',
    'Anxiety',
    'Depression',
    'Trauma',
    'Grief & Loss',
    'Relationship Issues',
    'Stress & Burnout',
    'Self-esteem',
    'Academic / Work Stress',
    'Family Issues',
];

export const LANGUAGES = [
    'English',
    'Hindi',
    'Assamese',
    'Bengali',
    'Gujarati',
    'Kannada',
    'Malayalam',
    'Marathi',
    'Nepali',
    'Odia',
    'Punjabi',
    'Tamil',
    'Telugu',
    'Urdu',
];

export const THERAPY_SERVICES = [
    { id: 'individual', label: 'Individual Therapy' },
    { id: 'couple', label: 'Couple Therapy' },
    { id: 'group', label: 'Group Therapy' },
    { id: 'family', label: 'Child & Adolescent Therapy' },
];

export const HOLISTIC_SERVICES = [
    { id: 'yoga', label: 'Yoga Therapy' },
    { id: 'nutrition', label: 'Nutrition Counselling' },
];

export const COUNSELLING_MODES = [
    { id: 'video', label: 'Video' },
    { id: 'audio', label: 'Audio' },
    { id: 'chat', label: 'Chat' },
];

export const SESSION_TIMES = [
    { id: 'morning', label: 'Morning (6 AM - 12 PM)' },
    { id: 'afternoon', label: 'Afternoon (12 PM - 5 PM)' },
    { id: 'evening', label: 'Evening (5 PM - 10 PM)' },
];

// ==========================================
// Filter State Type
// ==========================================

export interface TherapistFilters {
    specializations: string[];
    languages: string[];
    serviceTypes: string[];
    counsellingModes: string[];
    sessionTimes: string[];
    onlineOnly: boolean;
    nextAvailable: boolean;
}

export const defaultFilters: TherapistFilters = {
    specializations: [],
    languages: [],
    serviceTypes: [],
    counsellingModes: [],
    sessionTimes: [],
    onlineOnly: false,
    nextAvailable: false,
};

// ==========================================
// Props
// ==========================================

interface TherapistFilterProps {
    filters: TherapistFilters;
    onFiltersChange: (filters: TherapistFilters) => void;
    onClose: () => void;
    selectedServiceId?: string | null;
}

// ==========================================
// Component
// ==========================================

export default function TherapistFilter({
    filters,
    onFiltersChange,
    onClose,
    selectedServiceId,
}: TherapistFilterProps) {
    const [showMoreFilters, setShowMoreFilters] = useState(false);
    
    // Count active filters
    const activeFilterCount = 
        filters.specializations.length +
        filters.languages.length +
        filters.serviceTypes.length +
        filters.counsellingModes.length +
        filters.sessionTimes.length +
        (filters.onlineOnly ? 1 : 0) +
        (filters.nextAvailable ? 1 : 0);

    const toggleArrayFilter = (
        key: keyof Pick<TherapistFilters, 'specializations' | 'languages' | 'serviceTypes' | 'counsellingModes' | 'sessionTimes'>,
        value: string
    ) => {
        const current = filters[key];
        const updated = current.includes(value)
            ? current.filter(v => v !== value)
            : [...current, value];
        onFiltersChange({ ...filters, [key]: updated });
    };

    const clearAllFilters = () => {
        onFiltersChange(defaultFilters);
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-cyan-50 to-blue-50">
                <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-gray-900">Filters</h3>
                    {activeFilterCount > 0 && (
                        <span className="px-2 py-0.5 bg-cyan-500 text-white text-xs font-medium rounded-full">
                            {activeFilterCount} active
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {activeFilterCount > 0 && (
                        <button
                            onClick={clearAllFilters}
                            className="text-sm text-cyan-600 hover:underline"
                        >
                            Clear all
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
            </div>

            <div className="p-4 max-h-[60vh] overflow-y-auto">
                {/* Main Filters Grid */}
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                    {/* Specialization */}
                    <div>
                        <h4 className="font-medium text-gray-900 mb-3 text-sm uppercase tracking-wide">
                            Specialization
                        </h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                            {SPECIALIZATIONS.map(spec => (
                                <label
                                    key={spec}
                                    className="flex items-center gap-2 cursor-pointer group"
                                >
                                    <input
                                        type="checkbox"
                                        checked={filters.specializations.includes(spec)}
                                        onChange={() => toggleArrayFilter('specializations', spec)}
                                        className="w-4 h-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                                    />
                                    <span className="text-sm text-gray-700 group-hover:text-cyan-600 transition-colors">
                                        {spec}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Languages */}
                    <div>
                        <h4 className="font-medium text-gray-900 mb-3 text-sm uppercase tracking-wide">
                            Languages
                        </h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                            {LANGUAGES.map(lang => (
                                <label
                                    key={lang}
                                    className="flex items-center gap-2 cursor-pointer group"
                                >
                                    <input
                                        type="checkbox"
                                        checked={filters.languages.includes(lang)}
                                        onChange={() => toggleArrayFilter('languages', lang)}
                                        className="w-4 h-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                                    />
                                    <span className="text-sm text-gray-700 group-hover:text-cyan-600 transition-colors">
                                        {lang}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Service Type */}
                    <div>
                        <h4 className="font-medium text-gray-900 mb-3 text-sm uppercase tracking-wide">
                            Service Type
                        </h4>
                        
                        {/* Therapy Services */}
                        <div className="mb-4">
                            <p className="text-xs font-medium text-cyan-700 mb-2">Therapy Services</p>
                            <div className="space-y-2">
                                {THERAPY_SERVICES.map(service => (
                                    <label
                                        key={service.id}
                                        className={`flex items-center gap-2 cursor-pointer group ${
                                            selectedServiceId === service.id ? 'opacity-50 pointer-events-none' : ''
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={filters.serviceTypes.includes(service.id) || selectedServiceId === service.id}
                                            onChange={() => toggleArrayFilter('serviceTypes', service.id)}
                                            disabled={selectedServiceId === service.id}
                                            className="w-4 h-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                                        />
                                        <span className="text-sm text-gray-700 group-hover:text-cyan-600 transition-colors">
                                            {service.label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Holistic Services */}
                        <div>
                            <p className="text-xs font-medium text-green-700 mb-2">Holistic / Allied Services</p>
                            <div className="space-y-2">
                                {HOLISTIC_SERVICES.map(service => (
                                    <label
                                        key={service.id}
                                        className={`flex items-center gap-2 cursor-pointer group ${
                                            selectedServiceId === service.id ? 'opacity-50 pointer-events-none' : ''
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={filters.serviceTypes.includes(service.id) || selectedServiceId === service.id}
                                            onChange={() => toggleArrayFilter('serviceTypes', service.id)}
                                            disabled={selectedServiceId === service.id}
                                            className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                        />
                                        <span className="text-sm text-gray-700 group-hover:text-green-600 transition-colors">
                                            {service.label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* More Filters Toggle */}
                <button
                    onClick={() => setShowMoreFilters(!showMoreFilters)}
                    className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-cyan-600 transition-colors mb-4"
                >
                    {showMoreFilters ? (
                        <>
                            <ChevronUp className="w-4 h-4" />
                            Hide More Filters
                        </>
                    ) : (
                        <>
                            <ChevronDown className="w-4 h-4" />
                            Show More Filters
                        </>
                    )}
                </button>

                {/* More Filters */}
                {showMoreFilters && (
                    <div className="grid md:grid-cols-3 gap-6 pt-4 border-t border-gray-100">
                        {/* Counselling Mode */}
                        <div>
                            <h4 className="font-medium text-gray-900 mb-3 text-sm uppercase tracking-wide">
                                Counselling Mode
                            </h4>
                            <div className="space-y-2">
                                {COUNSELLING_MODES.map(mode => (
                                    <label
                                        key={mode.id}
                                        className="flex items-center gap-2 cursor-pointer group"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={filters.counsellingModes.includes(mode.id)}
                                            onChange={() => toggleArrayFilter('counsellingModes', mode.id)}
                                            className="w-4 h-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                                        />
                                        <span className="text-sm text-gray-700 group-hover:text-cyan-600 transition-colors">
                                            {mode.label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Availability */}
                        <div>
                            <h4 className="font-medium text-gray-900 mb-3 text-sm uppercase tracking-wide">
                                Availability
                            </h4>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={filters.onlineOnly}
                                        onChange={() => onFiltersChange({ ...filters, onlineOnly: !filters.onlineOnly })}
                                        className="w-4 h-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                                    />
                                    <span className="text-sm text-gray-700 group-hover:text-cyan-600 transition-colors">
                                        Online Only
                                    </span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={filters.nextAvailable}
                                        onChange={() => onFiltersChange({ ...filters, nextAvailable: !filters.nextAvailable })}
                                        className="w-4 h-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                                    />
                                    <span className="text-sm text-gray-700 group-hover:text-cyan-600 transition-colors">
                                        Next Earliest Available
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* Session Time */}
                        <div>
                            <h4 className="font-medium text-gray-900 mb-3 text-sm uppercase tracking-wide">
                                Session Time
                            </h4>
                            <div className="space-y-2">
                                {SESSION_TIMES.map(time => (
                                    <label
                                        key={time.id}
                                        className="flex items-center gap-2 cursor-pointer group"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={filters.sessionTimes.includes(time.id)}
                                            onChange={() => toggleArrayFilter('sessionTimes', time.id)}
                                            className="w-4 h-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                                        />
                                        <span className="text-sm text-gray-700 group-hover:text-cyan-600 transition-colors">
                                            {time.label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                <Button variant="outline" onClick={clearAllFilters}>
                    Reset
                </Button>
                <Button onClick={onClose} className="btn-icy">
                    Apply Filters
                </Button>
            </div>
        </div>
    );
}

// ==========================================
// Filter Helper Function
// ==========================================

export function applyTherapistFilters(
    therapists: any[],
    filters: TherapistFilters,
    searchQuery: string
): any[] {
    return therapists.filter(therapist => {
        // Search query filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchesName = therapist.user?.full_name?.toLowerCase().includes(query);
            const matchesSpecialty = therapist.specialties?.some((s: string) => 
                s.toLowerCase().includes(query)
            );
            if (!matchesName && !matchesSpecialty) return false;
        }

        // Specialization filter
        if (filters.specializations.length > 0) {
            const hasSpecialization = filters.specializations.some(spec =>
                therapist.specialties?.some((s: string) => 
                    s.toLowerCase().includes(spec.toLowerCase())
                )
            );
            if (!hasSpecialization) return false;
        }

        // Languages filter
        if (filters.languages.length > 0) {
            const hasLanguage = filters.languages.some(lang =>
                therapist.languages?.some((l: string) => 
                    l.toLowerCase() === lang.toLowerCase()
                )
            );
            if (!hasLanguage) return false;
        }

        // Counselling mode filter
        if (filters.counsellingModes.length > 0) {
            const modes = filters.counsellingModes;
            const acceptsMode = 
                (modes.includes('video') && therapist.accepts_video) ||
                (modes.includes('audio') && therapist.accepts_audio) ||
                (modes.includes('chat') && therapist.accepts_chat);
            if (!acceptsMode) return false;
        }

        // Online only filter
        if (filters.onlineOnly) {
            if (!therapist.accepts_video && !therapist.accepts_audio && !therapist.accepts_chat) {
                return false;
            }
        }

        return true;
    });
}
