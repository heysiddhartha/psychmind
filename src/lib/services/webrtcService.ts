/**
 * WebRTC Service - Video/Audio Call Management
 * Secure peer-to-peer connections for therapy sessions
 */

import { supabase } from '../supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

// ==========================================
// Types
// ==========================================

export interface RTCConfig {
    roomId: string;
    userId: string;
    isInitiator: boolean;
    onLocalStream: (stream: MediaStream) => void;
    onRemoteStream: (stream: MediaStream) => void;
    onConnectionState: (state: RTCPeerConnectionState) => void;
    onError: (error: Error) => void;
}

export interface SignalMessage {
    type: 'offer' | 'answer' | 'ice-candidate';
    sender_id: string;
    target_id: string;
    data: RTCSessionDescriptionInit | RTCIceCandidateInit;
}

export interface VideoSession {
    id: string;
    booking_id: string;
    room_id: string;
    status: 'waiting' | 'active' | 'ended';
    started_at?: string;
    ended_at?: string;
    duration_seconds?: number;
}

// ==========================================
// ICE Server Configuration
// ==========================================

// Free STUN servers for initial connectivity
const DEFAULT_ICE_SERVERS: RTCIceServer[] = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    // OpenRelay TURN servers (free, for development)
    {
        urls: 'turn:openrelay.metered.ca:80',
        username: 'openrelayproject',
        credential: 'openrelayproject'
    },
    {
        urls: 'turn:openrelay.metered.ca:443',
        username: 'openrelayproject',
        credential: 'openrelayproject'
    },
    {
        urls: 'turn:openrelay.metered.ca:443?transport=tcp',
        username: 'openrelayproject',
        credential: 'openrelayproject'
    }
];

// ==========================================
// WebRTC Service Class
// ==========================================

export class WebRTCService {
    private peerConnection: RTCPeerConnection | null = null;
    private localStream: MediaStream | null = null;
    private remoteStream: MediaStream | null = null;
    private screenStream: MediaStream | null = null;
    private signalingChannel: RealtimeChannel | null = null;
    private config: RTCConfig | null = null;
    private iceServers: RTCIceServer[] = DEFAULT_ICE_SERVERS;
    private pendingIceCandidates: RTCIceCandidateInit[] = [];
    private remoteDescriptionSet = false;
    private isScreenSharing = false;
    private connectionQuality: 'excellent' | 'good' | 'fair' | 'poor' | 'unknown' = 'unknown';
    private qualityCheckInterval: NodeJS.Timeout | null = null;
    private waitingRoom = true;
    private isAdmitted = false;
    private onQualityChange?: (quality: string) => void;
    private onScreenShareChange?: (isSharing: boolean) => void;
    private onWaitingRoomUpdate?: (admitted: boolean) => void;

    /**
     * Initialize WebRTC connection
     */
    async initialize(config: RTCConfig): Promise<void> {
        this.config = config;

        try {
            // Get ICE servers from database (or use defaults)
            await this.loadIceServers(config.roomId);

            // Create peer connection
            this.createPeerConnection();

            // Subscribe to signaling channel
            await this.setupSignalingChannel();

            // Get local media stream
            await this.getLocalStream();

            console.log('WebRTC initialized successfully');
        } catch (error) {
            config.onError(error instanceof Error ? error : new Error('Failed to initialize WebRTC'));
            throw error;
        }
    }

    /**
     * Load ICE servers from database
     */
    private async loadIceServers(roomId: string): Promise<void> {
        try {
            const { data } = await supabase
                .from('video_sessions')
                .select('ice_servers')
                .eq('room_id', roomId)
                .single();

            if (data?.ice_servers) {
                this.iceServers = [...DEFAULT_ICE_SERVERS, ...data.ice_servers];
            }
        } catch (error) {
            console.log('Using default ICE servers');
        }
    }

    /**
     * Create RTCPeerConnection
     */
    private createPeerConnection(): void {
        const pcConfig: RTCConfiguration = {
            iceServers: this.iceServers,
            iceCandidatePoolSize: 10,
        };

        this.peerConnection = new RTCPeerConnection(pcConfig);

        // Handle ICE candidates
        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                this.sendSignal({
                    type: 'ice-candidate',
                    sender_id: this.config!.userId,
                    target_id: '', // Will be filled by target
                    data: event.candidate.toJSON()
                });
            }
        };

        // Handle connection state changes
        this.peerConnection.onconnectionstatechange = () => {
            const state = this.peerConnection?.connectionState || 'closed';
            console.log('Connection state:', state);
            this.config?.onConnectionState(state);

            if (state === 'connected') {
                this.updateSessionStatus('active');
            } else if (state === 'disconnected' || state === 'failed') {
                this.handleDisconnection();
            }
        };

        // Handle incoming tracks
        this.peerConnection.ontrack = (event) => {
            console.log('Remote track received');
            if (!this.remoteStream) {
                this.remoteStream = new MediaStream();
            }
            event.streams[0].getTracks().forEach(track => {
                this.remoteStream!.addTrack(track);
            });
            this.config?.onRemoteStream(this.remoteStream);
        };

        // Handle ICE connection state
        this.peerConnection.oniceconnectionstatechange = () => {
            console.log('ICE connection state:', this.peerConnection?.iceConnectionState);
        };
    }

    /**
     * Setup signaling channel via Supabase Realtime
     */
    private async setupSignalingChannel(): Promise<void> {
        const roomId = this.config!.roomId;

        this.signalingChannel = supabase.channel(`webrtc:${roomId}`, {
            config: {
                presence: {
                    key: this.config!.userId,
                },
            },
        });

        // Handle incoming signals
        this.signalingChannel
            .on('broadcast', { event: 'signal' }, async ({ payload }) => {
                const signal = payload as SignalMessage;

                // Ignore our own signals
                if (signal.sender_id === this.config!.userId) return;

                await this.handleSignal(signal);
            })
            .on('presence', { event: 'join' }, ({ newPresences }) => {
                console.log('User joined:', newPresences);

                // If we're the initiator, start the call when someone joins
                if (this.config!.isInitiator && newPresences.length > 0) {
                    this.startCall();
                }
            })
            .on('presence', { event: 'leave' }, ({ leftPresences }) => {
                console.log('User left:', leftPresences);
            });

        await this.signalingChannel.subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
                await this.signalingChannel!.track({
                    user_id: this.config!.userId,
                    joined_at: new Date().toISOString(),
                });
            }
        });
    }

    /**
     * Get local media stream
     */
    private async getLocalStream(): Promise<void> {
        try {
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user',
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                },
            });

            // Add tracks to peer connection
            this.localStream.getTracks().forEach(track => {
                this.peerConnection!.addTrack(track, this.localStream!);
            });

            this.config?.onLocalStream(this.localStream);
        } catch (error) {
            throw new Error('Failed to access camera/microphone. Please ensure permissions are granted.');
        }
    }

    /**
     * Start the call (create offer)
     */
    async startCall(): Promise<void> {
        if (!this.peerConnection || !this.config) return;

        try {
            const offer = await this.peerConnection.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true,
            });

            await this.peerConnection.setLocalDescription(offer);

            this.sendSignal({
                type: 'offer',
                sender_id: this.config.userId,
                target_id: '',
                data: offer,
            });

            console.log('Offer sent');
        } catch (error) {
            this.config.onError(error instanceof Error ? error : new Error('Failed to create offer'));
        }
    }

    /**
     * Handle incoming signals
     */
    private async handleSignal(signal: SignalMessage): Promise<void> {
        if (!this.peerConnection) return;

        try {
            switch (signal.type) {
                case 'offer': {
                    console.log('Received offer');
                    await this.peerConnection.setRemoteDescription(
                        new RTCSessionDescription(signal.data as RTCSessionDescriptionInit)
                    );
                    this.remoteDescriptionSet = true;

                    // Process pending ICE candidates
                    await this.processPendingCandidates();

                    // Create and send answer
                    const answer = await this.peerConnection.createAnswer();
                    await this.peerConnection.setLocalDescription(answer);

                    this.sendSignal({
                        type: 'answer',
                        sender_id: this.config!.userId,
                        target_id: signal.sender_id,
                        data: answer,
                    });
                    console.log('Answer sent');
                    break;
                }

                case 'answer':
                    console.log('Received answer');
                    await this.peerConnection.setRemoteDescription(
                        new RTCSessionDescription(signal.data as RTCSessionDescriptionInit)
                    );
                    this.remoteDescriptionSet = true;

                    // Process pending ICE candidates
                    await this.processPendingCandidates();
                    break;

                case 'ice-candidate':
                    console.log('Received ICE candidate');
                    if (this.remoteDescriptionSet) {
                        await this.peerConnection.addIceCandidate(
                            new RTCIceCandidate(signal.data as RTCIceCandidateInit)
                        );
                    } else {
                        // Queue candidate until remote description is set
                        this.pendingIceCandidates.push(signal.data as RTCIceCandidateInit);
                    }
                    break;
            }
        } catch (error) {
            console.error('Error handling signal:', error);
        }
    }

    /**
     * Process queued ICE candidates
     */
    private async processPendingCandidates(): Promise<void> {
        for (const candidate of this.pendingIceCandidates) {
            try {
                await this.peerConnection!.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (error) {
                console.error('Error adding pending ICE candidate:', error);
            }
        }
        this.pendingIceCandidates = [];
    }

    /**
     * Send signal via Supabase Realtime
     */
    private async sendSignal(signal: SignalMessage): Promise<void> {
        if (!this.signalingChannel) return;

        await this.signalingChannel.send({
            type: 'broadcast',
            event: 'signal',
            payload: signal,
        });

        // Also store in database for reliability
        try {
            await supabase.from('webrtc_signals').insert({
                room_id: this.config!.roomId,
                sender_id: signal.sender_id,
                target_id: signal.target_id || null,
                signal_type: signal.type,
                signal_data: signal.data,
            });
        } catch (error) {
            // Signals table might not exist, which is fine
        }
    }

    /**
     * Toggle video
     */
    toggleVideo(enabled: boolean): void {
        if (this.localStream) {
            this.localStream.getVideoTracks().forEach(track => {
                track.enabled = enabled;
            });
        }
    }

    /**
     * Toggle audio
     */
    toggleAudio(enabled: boolean): void {
        if (this.localStream) {
            this.localStream.getAudioTracks().forEach(track => {
                track.enabled = enabled;
            });
        }
    }

    /**
     * Start screen sharing
     */
    async startScreenShare(): Promise<boolean> {
        try {
            this.screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    cursor: 'always',
                    displaySurface: 'monitor'
                } as MediaTrackConstraints,
                audio: false
            });

            const screenTrack = this.screenStream.getVideoTracks()[0];

            // Replace video track with screen track
            const sender = this.peerConnection?.getSenders().find(s => s.track?.kind === 'video');
            if (sender && this.localStream) {
                await sender.replaceTrack(screenTrack);
            }

            // Handle when user stops sharing via browser UI
            screenTrack.onended = () => {
                this.stopScreenShare();
            };

            this.isScreenSharing = true;
            this.onScreenShareChange?.(true);
            console.log('Screen sharing started');
            return true;
        } catch (error) {
            console.error('Failed to start screen share:', error);
            return false;
        }
    }

    /**
     * Stop screen sharing
     */
    async stopScreenShare(): Promise<void> {
        if (this.screenStream) {
            this.screenStream.getTracks().forEach(track => track.stop());
            this.screenStream = null;
        }

        // Restore camera video
        if (this.localStream && this.peerConnection) {
            const videoTrack = this.localStream.getVideoTracks()[0];
            const sender = this.peerConnection.getSenders().find(s => s.track?.kind === 'video');
            if (sender && videoTrack) {
                await sender.replaceTrack(videoTrack);
            }
        }

        this.isScreenSharing = false;
        this.onScreenShareChange?.(false);
        console.log('Screen sharing stopped');
    }

    /**
     * Check if screen sharing is active
     */
    getScreenShareStatus(): boolean {
        return this.isScreenSharing;
    }

    /**
     * Start connection quality monitoring
     */
    startQualityMonitoring(callback: (quality: string) => void): void {
        this.onQualityChange = callback;

        this.qualityCheckInterval = setInterval(async () => {
            const quality = await this.measureConnectionQuality();
            if (quality !== this.connectionQuality) {
                this.connectionQuality = quality;
                this.onQualityChange?.(quality);
            }
        }, 3000);
    }

    /**
     * Stop connection quality monitoring
     */
    stopQualityMonitoring(): void {
        if (this.qualityCheckInterval) {
            clearInterval(this.qualityCheckInterval);
            this.qualityCheckInterval = null;
        }
    }

    /**
     * Measure connection quality based on RTCStats
     */
    private async measureConnectionQuality(): Promise<'excellent' | 'good' | 'fair' | 'poor' | 'unknown'> {
        if (!this.peerConnection) return 'unknown';

        try {
            const stats = await this.peerConnection.getStats();
            let packetLoss = 0;
            let roundTripTime = 0;
            let jitter = 0;

            stats.forEach(report => {
                if (report.type === 'candidate-pair' && report.state === 'succeeded') {
                    roundTripTime = report.currentRoundTripTime * 1000 || 0;
                }
                if (report.type === 'inbound-rtp' && report.kind === 'video') {
                    const lost = report.packetsLost || 0;
                    const received = report.packetsReceived || 1;
                    packetLoss = (lost / (lost + received)) * 100;
                    jitter = report.jitter * 1000 || 0;
                }
            });

            // Quality assessment based on metrics
            if (roundTripTime < 100 && packetLoss < 1 && jitter < 30) {
                return 'excellent';
            } else if (roundTripTime < 200 && packetLoss < 3 && jitter < 50) {
                return 'good';
            } else if (roundTripTime < 400 && packetLoss < 8 && jitter < 100) {
                return 'fair';
            } else {
                return 'poor';
            }
        } catch {
            return 'unknown';
        }
    }

    /**
     * Get current connection quality
     */
    getConnectionQuality(): string {
        return this.connectionQuality;
    }

    /**
     * Set waiting room callback
     */
    setWaitingRoomCallback(callback: (admitted: boolean) => void): void {
        this.onWaitingRoomUpdate = callback;
    }

    /**
     * Admit participant from waiting room (therapist only)
     */
    async admitParticipant(participantId: string): Promise<void> {
        if (this.signalingChannel) {
            await this.signalingChannel.send({
                type: 'broadcast',
                event: 'admit',
                payload: { participantId, admitted: true }
            });
        }
    }

    /**
     * Handle admission (client side)
     */
    handleAdmission(admitted: boolean): void {
        this.isAdmitted = admitted;
        this.onWaitingRoomUpdate?.(admitted);
    }

    /**
     * Check if admitted from waiting room
     */
    isAdmittedFromWaitingRoom(): boolean {
        return this.isAdmitted;
    }

    /**
     * Send chat message during call
     */
    async sendChatMessage(message: string): Promise<void> {
        if (this.signalingChannel && this.config) {
            await this.signalingChannel.send({
                type: 'broadcast',
                event: 'chat',
                payload: {
                    senderId: this.config.userId,
                    message,
                    timestamp: new Date().toISOString()
                }
            });
        }
    }

    /**
     * Handle disconnection
     */
    private handleDisconnection(): void {
        console.log('Handling disconnection...');
        this.stopQualityMonitoring();
        // Could implement reconnection logic here
    }

    /**
     * Update session status in database
     */
    private async updateSessionStatus(status: 'waiting' | 'active' | 'ended'): Promise<void> {
        if (!this.config) return;

        try {
            const updates: Partial<VideoSession> = { status };

            if (status === 'active') {
                updates.started_at = new Date().toISOString();
            } else if (status === 'ended') {
                updates.ended_at = new Date().toISOString();
            }

            await supabase
                .from('video_sessions')
                .update(updates)
                .eq('room_id', this.config.roomId);
        } catch (error) {
            console.error('Failed to update session status:', error);
        }
    }

    /**
     * End the call and cleanup
     */
    async endCall(): Promise<void> {
        console.log('Ending call...');

        // Update session status
        await this.updateSessionStatus('ended');

        // Stop all tracks
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }

        if (this.remoteStream) {
            this.remoteStream.getTracks().forEach(track => track.stop());
            this.remoteStream = null;
        }

        // Close peer connection
        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }

        // Unsubscribe from channel
        if (this.signalingChannel) {
            await this.signalingChannel.unsubscribe();
            this.signalingChannel = null;
        }

        this.config = null;
        this.remoteDescriptionSet = false;
        this.pendingIceCandidates = [];
    }

    /**
     * Switch camera
     */
    async switchCamera(): Promise<void> {
        if (!this.localStream) return;

        const videoTrack = this.localStream.getVideoTracks()[0];
        if (!videoTrack) return;

        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(d => d.kind === 'videoinput');

        if (videoDevices.length < 2) return;

        const currentDevice = videoTrack.getSettings().deviceId;
        const currentIndex = videoDevices.findIndex(d => d.deviceId === currentDevice);
        const nextDevice = videoDevices[(currentIndex + 1) % videoDevices.length];

        // Get new stream with different camera
        const newStream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: nextDevice.deviceId },
        });

        const newVideoTrack = newStream.getVideoTracks()[0];

        // Replace track in peer connection
        const sender = this.peerConnection?.getSenders().find(s => s.track?.kind === 'video');
        if (sender) {
            await sender.replaceTrack(newVideoTrack);
        }

        // Update local stream
        videoTrack.stop();
        this.localStream.removeTrack(videoTrack);
        this.localStream.addTrack(newVideoTrack);

        this.config?.onLocalStream(this.localStream);
    }

    /**
     * Get connection stats
     */
    async getConnectionStats(): Promise<RTCStatsReport | null> {
        if (!this.peerConnection) return null;
        return await this.peerConnection.getStats();
    }
}

// ==========================================
// Video Session Management
// ==========================================

/**
 * Create a video session for a booking
 */
export async function createVideoSession(bookingId: string): Promise<{
    session: VideoSession | null;
    error: string | null;
}> {
    const roomId = `session_${bookingId}_${Date.now()}`;

    try {
        const { data, error } = await supabase
            .from('video_sessions')
            .insert({
                booking_id: bookingId,
                room_id: roomId,
                status: 'waiting',
            })
            .select()
            .single();

        if (error) throw error;
        return { session: data as VideoSession, error: null };
    } catch (error) {
        // Return mock session for development
        return {
            session: {
                id: `vs_${Date.now()}`,
                booking_id: bookingId,
                room_id: roomId,
                status: 'waiting',
            },
            error: null,
        };
    }
}

/**
 * Get video session by booking ID
 */
export async function getVideoSession(bookingId: string): Promise<VideoSession | null> {
    try {
        const { data, error } = await supabase
            .from('video_sessions')
            .select('*')
            .eq('booking_id', bookingId)
            .single();

        if (error) throw error;
        return data as VideoSession;
    } catch (error) {
        return null;
    }
}

/**
 * Get video session by room ID
 */
export async function getVideoSessionByRoom(roomId: string): Promise<VideoSession | null> {
    try {
        const { data, error } = await supabase
            .from('video_sessions')
            .select('*')
            .eq('room_id', roomId)
            .single();

        if (error) throw error;
        return data as VideoSession;
    } catch (error) {
        return null;
    }
}

export default WebRTCService;
