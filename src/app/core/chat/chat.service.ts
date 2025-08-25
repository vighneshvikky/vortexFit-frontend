import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { ChatMessage } from './interface/chat.interface';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private socket!: Socket;
  private messages$ = new BehaviorSubject<ChatMessage | null>(null);

  constructor(private zone: NgZone) {}

  connect() {
    if (this.socket?.connected) return;

    this.socket = io('http://localhost:3000', {
      withCredentials: true,
      transports: ['websocket'],
    });

    //listen for messages
    this.socket.on('receive_message', (msg: ChatMessage) => {
      this.zone.run(() => this.messages$.next(msg));
    });
  }

  send(receiverId: string, content: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.socket.emit('send_message', { receiverId, content }, (ack: any) => {
        if (ack?.ok) resolve(ack);
        else reject(ack);
      });
    });
  }

  stream(): Observable<ChatMessage | null> {
    return this.messages$.asObservable();
  }

  disconnect() {
    this.socket?.disconnect();
  }
}
