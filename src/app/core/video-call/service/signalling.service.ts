import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { SocketService } from '../../chat/services/socket.service';

export interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'user-join-request' | 'approval' | 'rejection';
  data?: RTCSessionDescriptionInit | RTCIceCandidateInit | any;
  sessionId: string;
  from: string;
  to?: string;
}

@Injectable({
  providedIn: 'root',
})
export class SignalingService {
  private messages$ = new Subject<SignalingMessage>();

  constructor(private socketService: SocketService) {}

  connect(userId: string, sessionId: string) {
    console.log('Connecting signaling service', { userId, sessionId });
    this.socketService.connect('video', userId);


    this.socketService.emit('video', 'join-video-room', { sessionId, userId });

    this.socketService.on<SignalingMessage>('video', 'signal').subscribe((msg) => {
      console.log('[SignalingService] Received signal:', msg);
      this.messages$.next(msg);
    });

    this.socketService.on<any>('video', 'user-joined').subscribe((msg) => {
      console.log('[SignalingService] User joined:', msg);
    });

    this.socketService.on<any>('video', 'user-left').subscribe((msg) => {
      console.log('[SignalingService] User left:', msg);
    });
  }

  sendOffer(sessionId: string, offer: RTCSessionDescriptionInit, targetUserId: string) {
    const message: SignalingMessage = {
      type: 'offer',
      sessionId,
      from: this.getCurrentUserId(),
      to: targetUserId,
      data: offer,
    };
    this.sendMessage(message);
  }

  sendAnswer(sessionId: string, answer: RTCSessionDescriptionInit, targetUserId: string) {
    const message: SignalingMessage = {
      type: 'answer',
      sessionId,
      from: this.getCurrentUserId(),
      to: targetUserId,
      data: answer,
    };
    this.sendMessage(message);
  }

  sendIceCandidate(sessionId: string, candidate: RTCIceCandidateInit, targetUserId: string) {
    const message: SignalingMessage = {
      type: 'ice-candidate',
      sessionId,
      from: this.getCurrentUserId(),
      to: targetUserId,
      data: candidate,
    };
    this.sendMessage(message);
  }

  sendMessage(msg: SignalingMessage) {
    console.log('[SignalingService] Sending message:', msg);
    

    this.socketService.emit('video', 'signal', {
      sessionId: msg.sessionId,
      targetUserId: msg.to,
      to: msg.to,
      type: msg.type,
      signal: msg.data,
    });
  }

  onMessage(): Observable<SignalingMessage> {
    return this.messages$.asObservable();
  }

  leaveRoom(sessionId: string, userId: string) {
    this.socketService.emit('video', 'leave-video-room', { sessionId, userId });
  }

  private getCurrentUserId(): string {

    return this.socketService.getSocketId('video');
  }
}