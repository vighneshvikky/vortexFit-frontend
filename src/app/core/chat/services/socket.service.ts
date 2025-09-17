
// import { Injectable } from '@angular/core';
// import { io, Socket } from 'socket.io-client';
// import { Observable, BehaviorSubject, Subject } from 'rxjs';
// import { environment } from '../../../../enviorments/environment';
// import { ChatMessage } from '../interfaces/chat.interface';

// @Injectable({
//   providedIn: 'root',
// })
// export class SocketService {
//   private socket: Socket | null = null;
//   private connected$ = new BehaviorSubject<boolean>(false);
//   private messages$ = new Subject<ChatMessage>();

//   constructor() {}

//   // Emit chat message
//   sendMessage(message: ChatMessage): void {
//     this.emit('send-message', message);
//   }

//   // Join/leave chat room
//   joinRoom(roomId: string): void {
//     this.emit('join-room', roomId);
//   }

//   leaveRoom(roomId: string): void {
//     this.emit('leave-room', roomId);
//   }

// joinVideoRoom(sessionId: string, userId: string): void {
//   this.emit('join-video-room', { sessionId, userId });
// }

// leaveVideoRoom(sessionId: string, userId: string): void {
//   this.emit('leave-video-room', { sessionId, userId });
// }


//   // Listen for incoming chat messages
//   getMessages(): Observable<ChatMessage> {
//     if (!this.socket) return this.messages$.asObservable();

//     this.socket.on('message', (msg: ChatMessage) => this.messages$.next(msg));
//     return this.messages$.asObservable();
//   }

//   // Connect to socket server
//   connect(userId: string, serverUrl: string = environment.api): void {
//     if (this.socket?.connected) return;

//     this.socket = io(serverUrl, {
//       transports: ['websocket'],
//       auth: { userId },
//       autoConnect: true,
//     });

//     this.socket.on('connect', () => {
//       console.log('Socket connected:', this.socket?.id);
//       this.connected$.next(true);
//     });

//     this.socket.on('disconnect', () => {
//       console.log('Socket disconnected');
//       this.connected$.next(false);
//     });

//     this.socket.on('error', (err) => console.error('Socket error:', err));
//   }

//   // Disconnect
//   disconnect(): void {
//     this.socket?.disconnect();
//     this.socket = null;
//   }

//   // Generic event emitter
//   emit(event: string, data?: any): void {
//     this.socket?.emit(event, data);
//   }

//   // Generic event listener
//   on<T>(event: string): Observable<T> {
//     const subject = new Subject<T>();
//     this.socket?.on(event, (data: T) => subject.next(data));
//     return subject.asObservable();
//   }

//   // Connection status observable
//   getConnectionStatus(): Observable<boolean> {
//     return this.connected$.asObservable();
//   }

//   // Check if socket is connected
//   isConnected(): boolean {
//     return !!this.socket?.connected;
//   }

//   // Get socket ID
//   getSocketId(): string {
//     return this.socket?.id || '';
//   }
// }
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { environment } from '../../../../enviorments/environment';
import { ChatMessage } from '../interfaces/chat.interface';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private sockets: { [namespace: string]: Socket } = {};
  private connected$: { [namespace: string]: BehaviorSubject<boolean> } = {};

  constructor() {}

  /**
   * Connect to a namespace (chat or video)
   */
  connect(namespace: 'chat' | 'video', userId: string, serverUrl: string = environment.api): void {
    console.log("from socket service", namespace, userId, serverUrl)
    if (this.sockets[namespace]?.connected) return;

    const url = `${serverUrl}/${namespace}`;
    const socket = io(url, {
      transports: ['websocket'],
      auth: { userId },
      autoConnect: true,
    });

    this.connected$[namespace] = new BehaviorSubject<boolean>(false);

    socket.on('connect', () => {
      console.log(`[${namespace}] socket connected:`, socket.id);
      this.connected$[namespace].next(true);
    });

    socket.on('disconnect', () => {
      console.log(`[${namespace}] socket disconnected`);
      this.connected$[namespace].next(false);
    });

    socket.on('error', (err) => console.error(`[${namespace}] socket error:`, err));

    this.sockets[namespace] = socket;
  }


  emit(namespace: 'chat' | 'video', event: string, data?: any): void {
    console.log('data', data);
    this.sockets[namespace]?.emit(event, data);
  }

  on<T>(namespace: 'chat' | 'video', event: string): Observable<T> {
    const subject = new Subject<T>();
    this.sockets[namespace]?.on(event, (data: T) => subject.next(data));
    return subject.asObservable();
  }

  /**
   * Disconnect namespace socket
   */
  disconnect(namespace: 'chat' | 'video'): void {
    if (this.sockets[namespace]) {
      this.sockets[namespace].disconnect();
      delete this.sockets[namespace];
      delete this.connected$[namespace];
    }
  }




  /**
   * Connection status observable per namespace
   */
  getConnectionStatus(namespace: 'chat' | 'video'): Observable<boolean> {
    return this.connected$[namespace]?.asObservable() || new BehaviorSubject(false).asObservable();
  }

  /**
   * Check if connected
   */
  isConnected(namespace: 'chat' | 'video'): boolean {
    return !!this.sockets[namespace]?.connected;
  }

  /**
   * Get socket ID
   */
  getSocketId(namespace: 'chat' | 'video'): string {
    return this.sockets[namespace]?.id || '';
  }
}
