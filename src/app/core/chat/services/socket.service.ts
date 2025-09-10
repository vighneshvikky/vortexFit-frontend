// socket.service.ts
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, BehaviorSubject } from 'rxjs';
import { ChatMessage } from '../interfaces/chat.interface';
import { environment } from '../../../../enviorments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;
  private connected$ = new BehaviorSubject<boolean>(false);
  private messages$ = new BehaviorSubject<ChatMessage | null>(null);
  private onlineUsers$ = new BehaviorSubject<string[]>([]);
  
  constructor() {
    // Initialize socket connection using environment API base
    this.socket = io(environment.api, {
      autoConnect: false,
      transports: ['websocket']
    });

    // Setup event listeners
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
      this.connected$.next(true);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.connected$.next(false);
    });

    this.socket.on('message', (message: ChatMessage) => {
      console.log('Received from socket:', message);
      this.messages$.next(message);
    });

    this.socket.on('user-online', (users: string[]) => {
      this.onlineUsers$.next(users);
    });

    this.socket.on('user-offline', (users: string[]) => {
      this.onlineUsers$.next(users);
    });

    this.socket.on('error', (error: any) => {
      console.error('Socket error:', error);
    });
  }

  // Connect to socket server
  connect(userId: string): void {
    if (!this.socket.connected) {
      this.socket.auth = { userId };
      this.socket.connect();
    }
  }

  // Disconnect from socket server
  disconnect(): void {
    if (this.socket.connected) {
      this.socket.disconnect();
    }
  }

  // Join a chat room
  joinRoom(roomId: string): void {
    this.socket.emit('join-room', roomId);
  }

  // Leave a chat room
  leaveRoom(roomId: string): void {
    this.socket.emit('leave-room', roomId);
  }

  // Send a message
    sendMessage(message: ChatMessage): void {
    this.socket.emit('send-message', message); // from here the backend receives the messsages
  }

  // Mark message as read
  markAsRead(messageId: string, userId: string): void {
    this.socket.emit('message-read', { messageId, userId });
  }

  // Send typing indicator
  startTyping(roomId: string, userId: string): void {
    this.socket.emit('typing-start', { roomId, userId });
  }

  stopTyping(roomId: string, userId: string): void {
    this.socket.emit('typing-stop', { roomId, userId });
  }

  // Observable streams
  getConnectionStatus(): Observable<boolean> {
    return this.connected$.asObservable();
  }

  getMessages(): Observable<ChatMessage | null> {
    return this.messages$.asObservable();
  }

  getOnlineUsers(): Observable<string[]> {
    return this.onlineUsers$.asObservable();
  }

  // Get typing users observable
  getTypingUsers(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('user-typing', (data) => observer.next(data));
      this.socket.on('user-stop-typing', (data) => observer.next(data));
    });
  }

  // Check if socket is connected
  isConnected(): boolean {
    return this.socket.connected;
  }

  // Get socket ID
  getSocketId(): string {
    return this.socket.id || '';
  }
}