/**
 * useWebRTC Hook - React hook for WebRTC video calls
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { WebRTCService, createVideoSession, type VideoSession } from '@/lib/services/webrtcService';

interface UseWebRTCOptions {
    roomId?: string;
    userId: string;
    autoConnect?: boolean;
}

interface UseWebRTCReturn {
    // State
    isConnecting: boolean;
    isConnected: boolean;
    connectionState: RTCPeerConnectionState;
    error: Error | null;

    // Streams
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;

    // Controls
    isVideoEnabled: boolean;
    isAudioEnabled: boolean;

    // Actions
    connect: (roomId: string) => Promise<void>;
    disconnect: () => Promise<void>;
    toggleVideo: () => void;
    toggleAudio: () => void;
    switchCamera: () => Promise<void>;
    createSession: (bookingId: string) => Promise<VideoSession | null>;

    // Refs for video elements
    localVideoRef: React.RefObject<HTMLVideoElement>;
    remoteVideoRef: React.RefObject<HTMLVideoElement>;
}

export function useWebRTC(options: UseWebRTCOptions): UseWebRTCReturn {
    const { userId, autoConnect = false } = options;

    // State
    const [isConnecting, setIsConnecting] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>('new');
    const [error, setError] = useState<Error | null>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);

    // Refs
    const webrtcService = useRef<WebRTCService | null>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const currentRoomId = useRef<string | null>(null);

    // Update video elements when streams change
    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    // Connect to room
    const connect = useCallback(async (roomId: string) => {
        if (isConnecting || isConnected) return;

        setIsConnecting(true);
        setError(null);
        currentRoomId.current = roomId;

        try {
            webrtcService.current = new WebRTCService();

            await webrtcService.current.initialize({
                roomId,
                userId,
                isInitiator: false, // Will be determined by who joins first
                onLocalStream: (stream) => {
                    setLocalStream(stream);
                },
                onRemoteStream: (stream) => {
                    setRemoteStream(stream);
                },
                onConnectionState: (state) => {
                    setConnectionState(state);
                    setIsConnected(state === 'connected');

                    if (state === 'disconnected' || state === 'failed' || state === 'closed') {
                        setIsConnected(false);
                    }
                },
                onError: (err) => {
                    setError(err);
                    setIsConnecting(false);
                    setIsConnected(false);
                }
            });

            setIsConnecting(false);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to connect'));
            setIsConnecting(false);
        }
    }, [userId, isConnecting, isConnected]);

    // Disconnect
    const disconnect = useCallback(async () => {
        if (webrtcService.current) {
            await webrtcService.current.endCall();
            webrtcService.current = null;
        }

        setLocalStream(null);
        setRemoteStream(null);
        setIsConnected(false);
        setConnectionState('closed');
        currentRoomId.current = null;
    }, []);

    // Toggle video
    const toggleVideo = useCallback(() => {
        if (webrtcService.current) {
            const newState = !isVideoEnabled;
            webrtcService.current.toggleVideo(newState);
            setIsVideoEnabled(newState);
        }
    }, [isVideoEnabled]);

    // Toggle audio
    const toggleAudio = useCallback(() => {
        if (webrtcService.current) {
            const newState = !isAudioEnabled;
            webrtcService.current.toggleAudio(newState);
            setIsAudioEnabled(newState);
        }
    }, [isAudioEnabled]);

    // Switch camera
    const switchCamera = useCallback(async () => {
        if (webrtcService.current) {
            await webrtcService.current.switchCamera();
        }
    }, []);

    // Create new session
    const createNewSession = useCallback(async (bookingId: string): Promise<VideoSession | null> => {
        const result = await createVideoSession(bookingId);
        if (result.error) {
            setError(new Error(result.error));
            return null;
        }
        return result.session;
    }, []);

    // Auto-connect if roomId provided
    // Auto-connect if roomId provided
    useEffect(() => {
        if (autoConnect && options.roomId) {
            connect(options.roomId);
        }

        // Cleanup on unmount
        return () => {
            disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        isConnecting,
        isConnected,
        connectionState,
        error,
        localStream,
        remoteStream,
        isVideoEnabled,
        isAudioEnabled,
        connect,
        disconnect,
        toggleVideo,
        toggleAudio,
        switchCamera,
        createSession: createNewSession,
        localVideoRef,
        remoteVideoRef
    };
}

export default useWebRTC;
