/**
 * useRealtimeSlots - React hook for real-time slot availability
 * Provides live updates when slots are booked or locked by other users
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
    subscribeToSlotAvailability,
    getActiveLocksForTherapist,
    lockSlotInDatabase,
    unlockSlotInDatabase,
    isSlotAvailable,
    type SlotLock,
    type SlotAvailabilityUpdate
} from '@/lib/services/bookingRealtimeService';
import { getAvailableSlots, type TimeSlot } from '@/lib/bookingService';
import { useToast } from '@/hooks/use-toast';

// ============================================
// Types
// ============================================

export interface RealtimeSlot extends TimeSlot {
    isLocked?: boolean;
    lockedBy?: string;
    isBeingBooked?: boolean;
}

export interface UseRealtimeSlotsResult {
    slots: RealtimeSlot[];
    lockedSlots: Map<string, SlotLock>;
    loading: boolean;
    error: string | null;
    selectedSlot: string | null;
    lockStatus: 'none' | 'locking' | 'locked' | 'failed';

    // Actions
    selectSlot: (time: string, slotIso?: string) => Promise<boolean>;
    deselectSlot: () => Promise<void>;
    refresh: () => Promise<void>;
}

export interface UseRealtimeSlotsOptions {
    therapistId: string | null;
    selectedDate: Date | null;
    userId: string | null;
    serviceDuration?: number;
    autoLock?: boolean; // Whether to lock slot on selection
    lockDurationMinutes?: number;
}

// ============================================
// Hook Implementation
// ============================================

export function useRealtimeSlots(options: UseRealtimeSlotsOptions): UseRealtimeSlotsResult {
    const {
        therapistId,
        selectedDate,
        userId,
        serviceDuration = 50,
        autoLock = true,
        lockDurationMinutes = 5
    } = options;

    const { toast } = useToast();

    // State
    const [slots, setSlots] = useState<RealtimeSlot[]>([]);
    const [lockedSlots, setLockedSlots] = useState<Map<string, SlotLock>>(new Map());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [lockStatus, setLockStatus] = useState<'none' | 'locking' | 'locked' | 'failed'>('none');

    // Refs for cleanup
    const cleanupRef = useRef<(() => void) | null>(null);
    const lockRefreshInterval = useRef<NodeJS.Timeout | null>(null);
    const currentLockId = useRef<string | null>(null);

    // Date string for subscriptions
    const dateStr = selectedDate?.toISOString().split('T')[0] || '';

    /**
     * Fetch initial slots and locks
     */
    const fetchSlots = useCallback(async () => {
        if (!therapistId || !selectedDate) {
            setSlots([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Fetch available slots
            const availableSlots = await getAvailableSlots(therapistId, selectedDate, serviceDuration);

            // Fetch active locks from other users
            const locks = await getActiveLocksForTherapist(therapistId, dateStr, userId || undefined);

            // Create locked slots map
            const lockMap = new Map<string, SlotLock>();
            locks.forEach(lock => {
                lockMap.set(lock.slot_datetime, lock);
            });
            setLockedSlots(lockMap);

            // Merge slots with lock info
            const realtimeSlots: RealtimeSlot[] = availableSlots.map(slot => {
                const slotDatetime = slot.iso || '';
                const lock = lockMap.get(slotDatetime);

                return {
                    ...slot,
                    isLocked: !!lock,
                    lockedBy: lock?.locked_by,
                    isBeingBooked: !!lock && lock.locked_by !== userId,
                    available: slot.available && (!lock || lock.locked_by === userId)
                };
            });

            setSlots(realtimeSlots);
        } catch (err) {
            console.error('Error fetching slots:', err);
            setError('Failed to load available times');
        } finally {
            setLoading(false);
        }
    }, [therapistId, selectedDate, dateStr, serviceDuration, userId]);

    /**
     * Handle real-time availability updates
     */
    const handleAvailabilityUpdate = useCallback((update: SlotAvailabilityUpdate) => {
        console.log('📡 Real-time update:', update);

        setSlots(prevSlots => {
            return prevSlots.map(slot => {
                if (slot.iso === update.slotDatetime) {
                    switch (update.type) {
                        case 'booked':
                            // Show toast if the selected slot was booked by someone else
                            if (selectedSlot === slot.time && update.bookedBy !== userId) {
                                toast({
                                    title: 'Slot Unavailable',
                                    description: 'This time slot was just booked by another user. Please select a different time.',
                                    variant: 'destructive'
                                });
                                setSelectedSlot(null);
                                setLockStatus('none');
                            }
                            return { ...slot, available: false, isBeingBooked: false };

                        case 'cancelled':
                            return { ...slot, available: true, isLocked: false, isBeingBooked: false };

                        case 'locked':
                            if (update.lockedBy && update.lockedBy !== userId) {
                                if (selectedSlot === slot.time) {
                                    toast({
                                        title: 'Slot Being Booked',
                                        description: 'Another user started booking this slot. It may become unavailable.',
                                        variant: 'default'
                                    });
                                }
                                return { ...slot, isLocked: true, isBeingBooked: true, lockedBy: update.lockedBy };
                            }
                            return slot;

                        case 'unlocked':
                            if (slot.lockedBy !== userId) {
                                return { ...slot, isLocked: false, isBeingBooked: false, lockedBy: undefined };
                            }
                            return slot;

                        default:
                            return slot;
                    }
                }
                return slot;
            });
        });

        // Update locked slots map
        if (update.type === 'locked' && update.lockedBy && update.lockedBy !== userId) {
            setLockedSlots(prev => {
                const newMap = new Map(prev);
                newMap.set(update.slotDatetime, {
                    id: '',
                    therapist_id: update.therapistId,
                    slot_datetime: update.slotDatetime,
                    locked_by: update.lockedBy!,
                    expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
                    created_at: new Date().toISOString()
                });
                return newMap;
            });
        } else if (update.type === 'unlocked') {
            setLockedSlots(prev => {
                const newMap = new Map(prev);
                newMap.delete(update.slotDatetime);
                return newMap;
            });
        }
    }, [selectedSlot, userId, toast]);

    /**
     * Select a slot and optionally lock it
     */
    const selectSlot = useCallback(async (time: string, slotIso?: string): Promise<boolean> => {
        if (!therapistId || !userId) {
            console.warn('Cannot select slot: missing therapist or user ID');
            return false;
        }

        // Find the slot
        const slot = slots.find(s => s.time === time);
        if (!slot) {
            console.warn('Slot not found:', time);
            return false;
        }

        if (!slot.available) {
            toast({
                title: 'Slot Unavailable',
                description: 'This time slot is no longer available.',
                variant: 'destructive'
            });
            return false;
        }

        const slotDatetime = slotIso || slot.iso;
        if (!slotDatetime) {
            console.warn('Slot datetime not available');
            setSelectedSlot(time);
            return true;
        }

        // Unlock previous slot if any
        if (selectedSlot && currentLockId.current) {
            const prevSlot = slots.find(s => s.time === selectedSlot);
            if (prevSlot?.iso) {
                await unlockSlotInDatabase(therapistId, prevSlot.iso, userId);
            }
        }

        setSelectedSlot(time);

        if (autoLock) {
            setLockStatus('locking');

            // Check availability first
            const availability = await isSlotAvailable(therapistId, slotDatetime, serviceDuration, userId);

            if (!availability.available) {
                setLockStatus('failed');
                toast({
                    title: 'Slot Unavailable',
                    description: availability.bookedBy
                        ? 'This slot is already booked.'
                        : 'This slot is being booked by another user.',
                    variant: 'destructive'
                });
                setSelectedSlot(null);
                return false;
            }

            // Try to lock the slot
            const lockResult = await lockSlotInDatabase(therapistId, slotDatetime, userId, lockDurationMinutes);

            if (!lockResult.success) {
                setLockStatus('failed');
                toast({
                    title: 'Could Not Reserve Slot',
                    description: lockResult.error || 'Please try a different time.',
                    variant: 'destructive'
                });
                setSelectedSlot(null);
                return false;
            }

            currentLockId.current = lockResult.lockId || null;
            setLockStatus('locked');

            // Set up lock refresh interval
            if (lockRefreshInterval.current) {
                clearInterval(lockRefreshInterval.current);
            }

            lockRefreshInterval.current = setInterval(async () => {
                if (therapistId && slotDatetime && userId) {
                    await lockSlotInDatabase(therapistId, slotDatetime, userId, lockDurationMinutes);
                }
            }, (lockDurationMinutes - 1) * 60 * 1000); // Refresh 1 minute before expiry
        }

        return true;
    }, [therapistId, userId, slots, selectedSlot, autoLock, lockDurationMinutes, serviceDuration, toast]);

    /**
     * Deselect current slot and release lock
     */
    const deselectSlot = useCallback(async () => {
        if (!therapistId || !userId || !selectedSlot) return;

        const slot = slots.find(s => s.time === selectedSlot);
        if (slot?.iso) {
            await unlockSlotInDatabase(therapistId, slot.iso, userId);
        }

        if (lockRefreshInterval.current) {
            clearInterval(lockRefreshInterval.current);
            lockRefreshInterval.current = null;
        }

        currentLockId.current = null;
        setSelectedSlot(null);
        setLockStatus('none');
    }, [therapistId, userId, selectedSlot, slots]);

    /**
     * Refresh slots data
     */
    const refresh = useCallback(async () => {
        await fetchSlots();
    }, [fetchSlots]);

    // Fetch slots when therapist/date changes
    useEffect(() => {
        fetchSlots();
    }, [fetchSlots]);

    // Set up real-time subscriptions
    useEffect(() => {
        if (!therapistId || !dateStr) {
            return;
        }

        // Clean up previous subscriptions
        if (cleanupRef.current) {
            cleanupRef.current();
        }

        // Subscribe to real-time updates
        const { cleanup } = subscribeToSlotAvailability(therapistId, dateStr, {
            onAvailabilityUpdate: handleAvailabilityUpdate,
            onError: (err) => {
                console.error('Real-time subscription error:', err);
            }
        });

        cleanupRef.current = cleanup;

        return () => {
            if (cleanupRef.current) {
                cleanupRef.current();
                cleanupRef.current = null;
            }
        };
    }, [therapistId, dateStr, handleAvailabilityUpdate]);

    // Cleanup locks on unmount or navigation
    useEffect(() => {
        return () => {
            // Release lock when component unmounts
            if (therapistId && userId && selectedSlot) {
                const slot = slots.find(s => s.time === selectedSlot);
                if (slot?.iso) {
                    unlockSlotInDatabase(therapistId, slot.iso, userId);
                }
            }

            if (lockRefreshInterval.current) {
                clearInterval(lockRefreshInterval.current);
            }
        };
    }, [therapistId, userId, selectedSlot, slots]);

    // Handle page visibility (release lock when tab becomes hidden for too long)
    useEffect(() => {
        let hiddenTimeout: NodeJS.Timeout | null = null;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                // Release lock after 2 minutes of being hidden
                hiddenTimeout = setTimeout(() => {
                    if (therapistId && userId && selectedSlot) {
                        const slot = slots.find(s => s.time === selectedSlot);
                        if (slot?.iso) {
                            unlockSlotInDatabase(therapistId, slot.iso, userId);
                            setSelectedSlot(null);
                            setLockStatus('none');
                        }
                    }
                }, 2 * 60 * 1000);
            } else {
                if (hiddenTimeout) {
                    clearTimeout(hiddenTimeout);
                    hiddenTimeout = null;
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            if (hiddenTimeout) {
                clearTimeout(hiddenTimeout);
            }
        };
    }, [therapistId, userId, selectedSlot, slots]);

    return {
        slots,
        lockedSlots,
        loading,
        error,
        selectedSlot,
        lockStatus,
        selectSlot,
        deselectSlot,
        refresh
    };
}

export default useRealtimeSlots;
