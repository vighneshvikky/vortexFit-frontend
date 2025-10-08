import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { environment } from '../../../../enviorments/environment';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private sockets: { [namespace: string]: Socket } = {};
  private connected$: { [namespace: string]: BehaviorSubject<boolean> } = {};
  private error$ = new Subject<{ namespace: string; message: string }>();

  constructor() {}

  connect(
    namespace: string,
    userId: string,
    serverUrl: string = environment.api
  ): void {
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

    socket.on('error', (err) => {
      console.error(`[${namespace}] socket error:`, err);
      this.error$.next({ namespace, message: err?.message });
    });

    this.sockets[namespace] = socket;
  }

  emit(namespace: string, event: string, data?: any): void {
    console.log('data', data);
    this.sockets[namespace]?.emit(event, data);
  }

  on<T>(namespace: string, event: string): Observable<T> {
    const subject = new Subject<T>();
    this.sockets[namespace]?.on(event, (data: T) => subject.next(data));
    return subject.asObservable();
  }

  disconnect(namespace: string): void {
    if (this.sockets[namespace]) {
      this.sockets[namespace].disconnect();
      delete this.sockets[namespace];
      delete this.connected$[namespace];
    }
  }

  getConnectionStatus(namespace: string): Observable<boolean> {
    return (
      this.connected$[namespace]?.asObservable() ||
      new BehaviorSubject(false).asObservable()
    );
  }

  isConnected(namespace: string): boolean {
    return !!this.sockets[namespace]?.connected;
  }

  getSocketId(namespace: string): string {
    return this.sockets[namespace]?.id || '';
  }

  getSocketErrors(): Observable<{ namespace: string; message: string }> {
    return this.error$.asObservable();
  }
}
