import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SignalingService } from './signalling.service';

@Injectable({
  providedIn: 'root',
})
export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream$ = new BehaviorSubject<MediaStream | null>(null);
  private connectionState$ = new BehaviorSubject<RTCPeerConnectionState>('new');
  
  private currentSessionId: string = '';
  private currentTargetUserId: string = '';

  private readonly iceServers: RTCIceServer[] = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    // Add TURN servers for production
    // { urls: 'turn:your-turn-server.com:3478', username: 'user', credential: 'pass' }
  ];

  constructor(private signalingService: SignalingService) {}

  /**
   * Initialize as caller (trainer)
   */
  async initializeAsCaller(sessionId: string, targetUserId: string): Promise<void> {
    console.log('[WebRTC] Initializing as caller');
    
    this.currentSessionId = sessionId;
    this.currentTargetUserId = targetUserId;
    
    this.createPeerConnection();
    
    if (this.localStream) {
      this.addLocalStreamToConnection();
    }
    
    try {
      // Create and send offer
      const offer = await this.peerConnection!.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      
      await this.peerConnection!.setLocalDescription(offer);

      this.signalingService.sendOffer(sessionId, offer, targetUserId);
      
    } catch (error) {
      console.error('[WebRTC] Error creating offer:', error);
      throw error;
    }
  }

  async initializeAsCallee(
    offer: RTCSessionDescriptionInit,
    sessionId: string,
    fromUserId: string
  ): Promise<void> {
    console.log('[WebRTC] Initializing as callee');
    
    this.currentSessionId = sessionId;
    this.currentTargetUserId = fromUserId;
    
    this.createPeerConnection();
    
    if (this.localStream) {
      this.addLocalStreamToConnection();
    }
    
    try {
      await this.peerConnection!.setRemoteDescription(offer);
      const answer = await this.peerConnection!.createAnswer();
      await this.peerConnection!.setLocalDescription(answer);
      this.signalingService.sendAnswer(sessionId, answer, fromUserId);
      
    } catch (error) {
      console.error('[WebRTC] Error handling offer:', error);
      throw error;
    }
  }


  async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    console.log('[WebRTC] Handling answer');
    
    if (!this.peerConnection) {
      console.error('[WebRTC] No peer connection available');
      return;
    }
    
    try {
      await this.peerConnection.setRemoteDescription(answer);
    } catch (error) {
      console.error('[WebRTC] Error setting remote description:', error);
      throw error;
    }
  }

  /**
   * Handle ICE candidate from remote peer
   */
  async handleIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    console.log('[WebRTC] Handling ICE candidate');
    
    if (!this.peerConnection) {
      console.error('[WebRTC] No peer connection available');
      return;
    }
    
    try {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error('[WebRTC] Error adding ICE candidate:', error);
    }
  }

  /**
   * Create and configure peer connection
   */
  private createPeerConnection(): void {
    this.peerConnection = new RTCPeerConnection({
      iceServers: this.iceServers,
    });

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('[WebRTC] Sending ICE candidate');
        this.signalingService.sendIceCandidate(
          this.currentSessionId,
          event.candidate.toJSON(),
          this.currentTargetUserId
        );
      }
    };

    // Handle remote stream
    this.peerConnection.ontrack = (event) => {
      console.log('[WebRTC] Received remote stream');
      const [remoteStream] = event.streams;
      this.remoteStream$.next(remoteStream);
    };

    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection!.connectionState;
      console.log('[WebRTC] Connection state changed:', state);
      this.connectionState$.next(state);
    };

    // Handle ICE connection state changes
    this.peerConnection.oniceconnectionstatechange = () => {
      console.log('[WebRTC] ICE connection state:', this.peerConnection!.iceConnectionState);
    };

    // Handle signaling state changes
    this.peerConnection.onsignalingstatechange = () => {
      console.log('[WebRTC] Signaling state:', this.peerConnection!.signalingState);
    };
  }

  /**
   * Add local stream to peer connection
   */
  private addLocalStreamToConnection(): void {
    if (!this.localStream || !this.peerConnection) return;

    this.localStream.getTracks().forEach((track) => {
      this.peerConnection!.addTrack(track, this.localStream!);
    });
  }

  /**
   * Set local stream
   */
  setLocalStream(stream: MediaStream): void {
    this.localStream = stream;
    
    if (this.peerConnection) {
      this.addLocalStreamToConnection();
    }
  }

  /**
   * Replace video/audio track (for screen sharing)
   */
  replaceTrack(oldTrack: MediaStreamTrack, newTrack: MediaStreamTrack): RTCRtpSender | null {
    if (!this.peerConnection) return null;

    const sender = this.peerConnection.getSenders().find(s => s.track === oldTrack);
    if (sender) {
      sender.replaceTrack(newTrack);
      return sender;
    }
    return null;
  }

  /**
   * Get remote stream observable
   */
  getRemoteStream$(): Observable<MediaStream | null> {
    return this.remoteStream$.asObservable();
  }

  /**
   * Get connection state observable
   */
  getConnectionState$(): Observable<RTCPeerConnectionState> {
    return this.connectionState$.asObservable();
  }

  /**
   * Retry connection
   */
  async retryConnection(): Promise<void> {
    console.log('[WebRTC] Retrying connection');
    
    if (this.peerConnection) {
      this.peerConnection.close();
    }
    
    // Recreate connection with existing parameters
    if (this.currentSessionId && this.currentTargetUserId) {
      await this.initializeAsCaller(this.currentSessionId, this.currentTargetUserId);
    }
  }

  /**
   * End call and cleanup
   */
  endCall(): void {
    console.log('[WebRTC] Ending call');
    
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    
    this.remoteStream$.next(null);
    this.connectionState$.next('closed');
    
    this.currentSessionId = '';
    this.currentTargetUserId = '';
  }

  /**
   * Get current connection state
   */
  getConnectionState(): RTCPeerConnectionState {
    return this.peerConnection?.connectionState || 'new';
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.peerConnection?.connectionState === 'connected';
  }
}