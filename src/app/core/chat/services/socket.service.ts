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


  connect(namespace: 'chat' | 'video', userId: string, serverUrl: string = environment.api): void {
   
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


  disconnect(namespace: 'chat' | 'video'): void {
    if (this.sockets[namespace]) {
      this.sockets[namespace].disconnect();
      delete this.sockets[namespace];
      delete this.connected$[namespace];
    }
  }





  getConnectionStatus(namespace: 'chat' | 'video'): Observable<boolean> {
    return this.connected$[namespace]?.asObservable() || new BehaviorSubject(false).asObservable();
  }

  
  isConnected(namespace: 'chat' | 'video'): boolean {
    return !!this.sockets[namespace]?.connected;
  }

 
  getSocketId(namespace: 'chat' | 'video'): string {
    return this.sockets[namespace]?.id || '';
  }
}
