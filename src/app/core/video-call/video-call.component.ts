import {
  Component,
  ElementRef,
  Input,
  ViewChild,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { WebRTCService } from './service/webrtc.service';
import {
  SignalingMessage,
  SignalingService,
} from './service/signalling.service';
import { BookingSession } from '../../features/trainer/pages/trainer-session/interface/trainer.session.interface';

@Component({
  selector: 'app-video-call',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-call.component.html',
  styleUrls: ['./video-call.component.scss'],
})
export class VideoCallComponent implements OnDestroy {
  @Input() session: BookingSession | null = null;
  @Input() isCallModalOpen = false;
  @Input() role: 'trainer' | 'user' = 'user';

  @Output() callEnded = new EventEmitter<void>();
  @Output() callMinimized = new EventEmitter<void>();

  @ViewChild('localVideo', { static: false })
  localVideoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo', { static: false })
  remoteVideoElement!: ElementRef<HTMLVideoElement>;

  isMicrophoneOn = true;
  isCameraOn = true;
  isScreenSharing = false;
  isChatOpen = false;
  callDuration = 0;
  isConnecting = false;
  hasLocalStream = false;
  hasRemoteStream = false;
  errorMessage = '';
  pendingUser: string | null = null;
  showApprovalModal = false;

  private subscriptions: Subscription[] = [];
  private callTimer?: any;
  private localStream?: MediaStream;

  constructor(
    private webRTCService: WebRTCService,
    private signalingService: SignalingService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isCallModalOpen'] && this.isCallModalOpen && this.session) {
      this.initializeCall();
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((s) => s.unsubscribe());
    this.cleanup();
  }

  private setupSubscriptions() {
    // Subscribe to remote stream
    const remoteStreamSub = this.webRTCService
      .getRemoteStream$()
      .subscribe((stream) => {
        if (stream && this.remoteVideoElement) {
          this.remoteVideoElement.nativeElement.srcObject = stream;
          this.hasRemoteStream = true;
        } else {
          this.hasRemoteStream = false;
        }
      });

    // Subscribe to connection state changes
    const connectionStateSub = this.webRTCService
      .getConnectionState$()
      .subscribe((state) => {
        this.isConnecting = state === 'connecting';
        if (state === 'failed' || state === 'disconnected') {
          this.errorMessage = 'Connection lost. Trying to reconnect...';
        } else if (state === 'connected') {
          this.errorMessage = '';
          this.startCallTimer();
        }
      });

    // Subscribe to signaling messages
    const messagesSub = this.signalingService
      .onMessage()
      .subscribe(async (msg) => {
        console.log('[VideoCall] Received message:', msg);

        if (this.role === 'trainer') {
          await this.handleTrainerMessages(msg);
        } else {
          await this.handleUserMessages(msg);
        }
      });

    this.subscriptions.push(remoteStreamSub, connectionStateSub, messagesSub);
  }

  private async initializeCall() {
    try {
      // 1. Get local media first
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      this.localVideoElement.nativeElement.srcObject = this.localStream;
      this.hasLocalStream = true;

      // 2. Set up WebRTC service
      this.webRTCService.setLocalStream(this.localStream);

      console.log('[VideoCall] session object', this.session);
      console.log('[VideoCall] role', this.role);

      const currentUserId = this.getUserId(
        this.role === 'trainer' ? this.session!.trainerId : this.session!.userId
      );

      // 3. Connect to signaling server
      this.signalingService.connect(currentUserId, this.session!._id);

      // 4. Set up subscriptions AFTER connecting
      this.setupSubscriptions();

      // 5. Handle role-specific logic
      if (this.role === 'user') {
        // User sends join request after connecting
        const targetUserId = this.getUserId(this.session!.trainerId);

        this.signalingService.sendMessage({
          type: 'user-join-request',
          from: currentUserId,
          to: targetUserId,
          sessionId: this.session!._id,
          data: {},
        });
      }
    } catch (err) {
      console.error('Error initializing call', err);
      this.errorMessage = 'Failed to start video call';
    }
  }

  private getUserId(user: any): string {
    console.log('[VideoCall] Getting user ID:', user);
    return typeof user === 'string' ? user : user._id || user.id;
  }

  private async handleTrainerMessages(msg: SignalingMessage) {
    switch (msg.type) {
      case 'user-join-request':
        console.log('[Trainer] User wants to join:', msg.from);
        this.pendingUser = msg.from;
        this.showApprovalModal = true;
        break;

      case 'answer':
        await this.webRTCService.handleAnswer(
          msg.data as RTCSessionDescriptionInit
        );
        break;

      case 'ice-candidate':
        await this.webRTCService.handleIceCandidate(
          msg.data as RTCIceCandidateInit
        );
        break;
    }
  }

  private async handleUserMessages(msg: SignalingMessage) {
    switch (msg.type) {
      case 'approval':
        // Trainer approved, wait for offer
        console.log('[User] Trainer approved, waiting for offer');
        break;

      case 'offer':
        // Receive offer and set up as callee
        await this.webRTCService.initializeAsCallee(
          msg.data as RTCSessionDescriptionInit,
          this.session!._id,
          msg.from
        );
        break;

      case 'answer':
        await this.webRTCService.handleAnswer(
          msg.data as RTCSessionDescriptionInit
        );
        break;

      case 'ice-candidate':
        await this.webRTCService.handleIceCandidate(
          msg.data as RTCIceCandidateInit
        );
        break;

      case 'rejection':
        this.errorMessage = 'Call request was declined';
        this.endCall();
        break;
    }
  }

  // Call this when trainer clicks "Approve" in modal
  approveUser() {
    if (!this.pendingUser || !this.session) return;

    const trainerId = this.getUserId(this.session.trainerId);

    // 1. Notify user of approval
    this.signalingService.sendMessage({
      type: 'approval',
      sessionId: this.session._id,
      from: trainerId,
      to: this.pendingUser,
      data: {},
    });

    // 2. Initialize WebRTC as caller and create offer
    this.webRTCService.initializeAsCaller(this.session._id, this.pendingUser);

    // 3. Reset state
    this.pendingUser = null;
    this.showApprovalModal = false;
  }
  // Call this when trainer clicks "Reject" in modal
  rejectUser() {
    if (!this.pendingUser || !this.session) return;

    const trainerId = this.session.trainerId._id ?? this.session.trainerId;

    // Notify user of rejection (optional)
    this.signalingService.sendMessage({
      type: 'rejection',
      sessionId: this.session._id,
      from: trainerId,
      to: this.pendingUser,
      data: { message: 'Call request was declined' },
    });

    // Reset pending user
    this.pendingUser = null;
    this.showApprovalModal = false;
  }

  /** Get local camera + microphone and attach to video element */
  private async startLocalStream() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: this.isCameraOn,
        audio: this.isMicrophoneOn,
      });

      this.localStream = stream;

      // Set video srcObject
      if (this.localVideoElement) {
        this.localVideoElement.nativeElement.srcObject = stream;
      }
      console.log('stream', stream);
      // Pass to WebRTCService for peer connection
      this.webRTCService.setLocalStream(stream);
      this.hasLocalStream = true;
    } catch (err) {
      console.error('Error accessing media devices', err);
      this.errorMessage = 'Could not access camera or microphone';
      this.hasLocalStream = false;
    }
  }

  private startCallTimer() {
    this.callTimer = setInterval(() => {
      this.callDuration++;
    }, 1000);
  }

  /** Toggle microphone on/off */
  toggleMicrophone() {
    if (this.localStream) {
      const audioTracks = this.localStream.getAudioTracks();
      if (audioTracks.length > 0) {
        audioTracks[0].enabled = !audioTracks[0].enabled;
        this.isMicrophoneOn = audioTracks[0].enabled;
      }
    }
  }

  /** Toggle camera on/off */
  toggleCamera() {
    if (this.localStream) {
      const videoTracks = this.localStream.getVideoTracks();
      if (videoTracks.length > 0) {
        videoTracks[0].enabled = !videoTracks[0].enabled;
        this.isCameraOn = videoTracks[0].enabled;
      }
    }
  }

  /** Toggle screen sharing */
  async toggleScreenShare() {
    try {
      if (!this.isScreenSharing) {
        // Start screen sharing
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });

        // Replace video track with screen share
        const videoTrack = screenStream.getVideoTracks()[0];
        if (this.localStream) {
          const sender = this.webRTCService.replaceTrack(
            this.localStream.getVideoTracks()[0],
            videoTrack
          );

          videoTrack.onended = () => {
            // Screen sharing ended, switch back to camera
            this.stopScreenShare();
          };
        }

        this.isScreenSharing = true;
      } else {
        this.stopScreenShare();
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
      this.errorMessage = 'Could not start screen sharing';
    }
  }

  private async stopScreenShare() {
    try {
      // Get camera stream again
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: this.isCameraOn,
        audio: this.isMicrophoneOn,
      });

      const videoTrack = cameraStream.getVideoTracks()[0];
      if (this.localStream) {
        // Replace screen share track with camera track
        this.webRTCService.replaceTrack(
          this.localStream.getVideoTracks()[0],
          videoTrack
        );

        // Update local stream
        this.localStream = cameraStream;
        if (this.localVideoElement) {
          this.localVideoElement.nativeElement.srcObject = cameraStream;
        }
      }

      this.isScreenSharing = false;
    } catch (error) {
      console.error('Error stopping screen share:', error);
    }
  }

  /** Toggle chat panel */
  toggleChat() {
    this.isChatOpen = !this.isChatOpen;
  }

  /** Minimize call window */
  minimizeCall() {
    this.callMinimized.emit();
  }

  /** End the call */
  endCall() {
    this.cleanup();
    this.callEnded.emit();
  }

  private cleanup() {
    // Stop all tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
    }

    // Clear timer
    if (this.callTimer) {
      clearInterval(this.callTimer);
    }

    // End WebRTC call
    this.webRTCService.endCall();

    // Leave signaling room
    if (this.session) {
      const currentUserId = this.session.userId._id;
      this.signalingService.leaveRoom(this.session._id, currentUserId);
    }
  }

  /** Get user initials for avatar */


  /** Format call duration to MM:SS */
  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  }

  /** Handle errors gracefully */
  private handleError(error: any, message: string) {
    console.error(message, error);
    this.errorMessage = message;

    // Clear error after 5 seconds
    setTimeout(() => {
      this.errorMessage = '';
    }, 5000);
  }

  /** Check if user has granted media permissions */
  private async checkMediaPermissions(): Promise<boolean> {
    try {
      const permissions = await Promise.all([
        navigator.permissions.query({ name: 'camera' as PermissionName }),
        navigator.permissions.query({ name: 'microphone' as PermissionName }),
      ]);

      return permissions.every(
        (permission) =>
          permission.state === 'granted' || permission.state === 'prompt'
      );
    } catch (error) {
      console.warn('Could not check media permissions:', error);
      return true; // Assume permissions are available
    }
  }

  /** Retry connection if it fails */
  async retryConnection() {
    this.errorMessage = '';
    this.isConnecting = true;

    try {
      await this.webRTCService.retryConnection();
      this.isConnecting = false;
    } catch (error) {
      this.handleError(error, 'Failed to reconnect. Please try again.');
      this.isConnecting = false;
    }
  }
}
