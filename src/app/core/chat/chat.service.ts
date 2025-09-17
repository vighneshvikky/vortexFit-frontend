// chat.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { ChatMessage, ChatRoom } from './interfaces/chat.interface';
import { environment } from '../../../enviorments/environment';
import { SocketService } from './services/socket.service';
import { API_ROUTES } from '../../app.routes.constants';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private apiUrl = environment.api + API_ROUTES.CHAT.BASE;
  private CHAT = API_ROUTES.CHAT;
  private messageSubject = new Subject<ChatMessage>();
  private roomsSubject = new BehaviorSubject<ChatRoom[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);
  private messages$ = new BehaviorSubject<ChatMessage[]>([]);

  constructor(private http: HttpClient, private socket: SocketService) {
    this.socket.on<ChatMessage>('chat', 'message').subscribe((msg) => {
      if (msg) {
        const current = this.messages$.value;
        this.messages$.next([...current, msg]);
      }
    });
  }

  getMessages(
    roomId: string,
    page: number = 1,
    limit: number = 3
  ): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(
      `${this.apiUrl}/messages/${roomId}?page=${page}&limit=${limit}`
    );
  }

  // expose observable for components
  getMessagesStream() {
    return this.messages$.asObservable();
  }

  // send message
  send(peerId: string, senderId: string, content: string) {
    const roomId = this.generateRoomId(senderId, peerId);
    const message: ChatMessage = {
      content,
      senderId,
      receiverId: peerId,
      roomId,
      timestamp: new Date(),
      messageType: 'text',
      isRead: false,
      isDelivered: false,
    };

    // optimistic update
    this.messages$.next([...this.messages$.value, message]);

    // emit via socket (namespace chat)
    this.socket.emit('chat', 'send-message', message);
  }

  private generateRoomId(user1: string, user2: string): string {
    return [user1, user2].sort().join('_');
  }

  // Get all chat rooms for a user
  getChatRooms(userId: string): Observable<ChatRoom[]> {
    return this.http.get<ChatRoom[]>(
      `${this.apiUrl}${this.CHAT.ROOMS.GET_BY_USER(userId)}`
    );
  }

  createChatRoom(
    participants: string[],
    roomType: 'individual' | 'group' = 'individual'
  ): Observable<ChatRoom> {
    return this.http.post<ChatRoom>(`${this.apiUrl}${this.CHAT.ROOMS.CREATE}`, {
      participants,
      roomType,
    });
  }

  // Get or create a chat room between two users
  getOrCreateRoom(userId1: string, userId2: string): Observable<ChatRoom> {
    return this.http.post<ChatRoom>(
      `${this.apiUrl}${this.CHAT.ROOMS.GET_OR_CREATE}`,
      {
        userId1,
        userId2,
      }
    );
  }

  sendMessage(message: Partial<ChatMessage>): Observable<ChatMessage> {
    return this.http.post<ChatMessage>(
      `${this.apiUrl}${this.CHAT.MESSAGES.SEND}`,
      message
    );
  }

  stream(): Observable<ChatMessage> {
    return this.messageSubject.asObservable();
  }

  addMessageToStream(message: ChatMessage): void {
    this.messageSubject.next(message);
  }

  getRoomsObservable(): Observable<ChatRoom[]> {
    return this.roomsSubject.asObservable();
  }

  updateRooms(rooms: ChatRoom[]): void {
    this.roomsSubject.next(rooms);
  }

  getUnreadCountObservable(): Observable<number> {
    return this.unreadCountSubject.asObservable();
  }

  updateUnreadCount(count: number): void {
    this.unreadCountSubject.next(count);
  }

  connect(userId: string): void {
    this.socket.connect('chat', userId);

    this.socket.on<ChatMessage>('chat', 'message').subscribe((msg) => {
      if (msg) this.addMessageToStream(msg);
    });
  }

  disconnect(): void {
    this.socket.disconnect('chat');
  }

  joinRoom(roomId: string): void {
    this.socket.emit('chat', 'join-room', roomId);
  }

  leaveRoomSocket(roomId: string): void {
    this.socket.emit('chat', 'leave-room', roomId);
  }

  leaveRoom(roomId: string, userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/rooms/${roomId}/leave/${userId}`);
  }

  ngOnDestroy(): void {
    this.messageSubject.complete();
    this.roomsSubject.complete();
    this.unreadCountSubject.complete();
  }
}
