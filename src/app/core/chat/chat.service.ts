// chat.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { ChatMessage, ChatRoom } from './interfaces/chat.interface';
import { environment } from '../../../enviorments/environment';
import { SocketService } from './services/socket.service';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private apiUrl = `${environment.api}/chat`;
  private messageSubject = new Subject<ChatMessage>();
  private roomsSubject = new BehaviorSubject<ChatRoom[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);
private messages$ = new BehaviorSubject<ChatMessage[]>([]);
  constructor(private http: HttpClient, private socket: SocketService) {
     this.socket.getMessages().subscribe((msg) => {
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
    const current = this.messages$.value;
    this.messages$.next([...current, message]);

    // emit via socket → backend will persist + broadcast
    this.socket.sendMessage(message);
  }

  private generateRoomId(user1: string, user2: string): string {
    return [user1, user2].sort().join('_');
  }

  // Get all chat rooms for a user
  getChatRooms(userId: string): Observable<ChatRoom[]> {
    return this.http.get<ChatRoom[]>(`${this.apiUrl}/rooms/${userId}`);
  }

  createChatRoom(
    participants: string[],
    roomType: 'individual' | 'group' = 'individual'
  ): Observable<ChatRoom> {
    return this.http.post<ChatRoom>(`${this.apiUrl}/rooms`, {
      participants,
      roomType,
    });
  }

  // Get or create a chat room between two users
  getOrCreateRoom(userId1: string, userId2: string): Observable<ChatRoom> {
    return this.http.post<ChatRoom>(`${this.apiUrl}/rooms/get-or-create`, {
      userId1,
      userId2,
    });
  }

  // Send message via HTTP (backup for when socket is offline)
  sendMessage(message: Partial<ChatMessage>): Observable<ChatMessage> {
    return this.http.post<ChatMessage>(`${this.apiUrl}/messages`, message);
  }

  // Mark messages as read
  markMessagesAsRead(roomId: string, userId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/messages/read`, { roomId, userId });
  }

  // Get unread message count for a user
  getUnreadCount(userId: string): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(
      `${this.apiUrl}/messages/unread-count/${userId}`
    );
  }

  // Search messages in a room
  searchMessages(roomId: string, query: string): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(
      `${this.apiUrl}/messages/search/${roomId}?q=${encodeURIComponent(query)}`
    );
  }

  // Delete a message
  deleteMessage(messageId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/messages/${messageId}`);
  }

  // Update message (for editing)
  updateMessage(messageId: string, content: string): Observable<ChatMessage> {
    return this.http.put<ChatMessage>(`${this.apiUrl}/messages/${messageId}`, {
      content,
    });
  }

  // Upload file/image for chat
  uploadChatFile(file: File, roomId: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('roomId', roomId);

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
    });

    return this.http.post(`${this.apiUrl}/upload`, formData, { headers });
  }

  // === Real-time Features (used with Socket.IO) ===

  // Stream for real-time messages (used by Socket service)
  stream(): Observable<ChatMessage> {
    return this.messageSubject.asObservable();
  }

  // Add message to stream (called by Socket service)
  addMessageToStream(message: ChatMessage): void {
    this.messageSubject.next(message);
  }

  // Get rooms observable
  getRoomsObservable(): Observable<ChatRoom[]> {
    return this.roomsSubject.asObservable();
  }

  // Update rooms (called when new messages arrive)
  updateRooms(rooms: ChatRoom[]): void {
    this.roomsSubject.next(rooms);
  }

  // Get unread count observable
  getUnreadCountObservable(): Observable<number> {
    return this.unreadCountSubject.asObservable();
  }

  // Update unread count
  updateUnreadCount(count: number): void {
    this.unreadCountSubject.next(count);
  }

  // === Utility Methods ===

  // Generate consistent room ID for two users
  // generateRoomId(userId1: string, userId2: string): string {
  //   return [userId1, userId2].sort().join('_');
  // }

  // Connect to socket with current user
  connect(userId: string): void {
    this.socket.connect(userId);

    // bridge socket messages into chat stream
    this.socket.getMessages().subscribe((msg) => {
      if (msg) this.addMessageToStream(msg);
    });
  }

  // Disconnect from socket
  disconnect(): void {
    this.socket.disconnect();
  }

  // Send message through socket
//   async send(peerId: string,senderId: string, content: string): Promise<void> {
//  console.log('peerId', peerId);
//  console.log('senderId', senderId);
//   if (!senderId) {
//     console.error('Missing senderId in localStorage');
//     return;
//   }

//   const roomId = this.generateRoomId(senderId, peerId);

//     const message: ChatMessage = {
//       content,
//       senderId,
//       receiverId: peerId,
//       roomId,
//       timestamp: new Date(),
//       messageType: 'text',
//       isRead: false,
//       isDelivered: false,
//     };

//     // optimistic update
//     this.addMessageToStream(message);
//   this.socket.sendMessage(message);
//   this.sendMessage(message).subscribe({
//     next: res => console.log('Message persisted', res),
//     error: err => console.error('Error persisting message', err),
//   });
//   }

  // === Chat Room Management ===

  // Join a chat room (socket)
  joinRoom(roomId: string): void {
    this.socket.joinRoom(roomId);
  }

  // Leave a chat room (socket)
  leaveRoomSocket(roomId: string): void {
    this.socket.leaveRoom(roomId);
  }

  // Leave a chat room (HTTP)
  leaveRoom(roomId: string, userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/rooms/${roomId}/leave/${userId}`);
  }

  // Add participant to room
  addParticipant(roomId: string, userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/rooms/${roomId}/participants`, {
      userId,
    });
  }

  // Remove participant from room
  removeParticipant(roomId: string, userId: string): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/rooms/${roomId}/participants/${userId}`
    );
  }

  // Update room settings
  updateRoom(roomId: string, updates: Partial<ChatRoom>): Observable<ChatRoom> {
    return this.http.put<ChatRoom>(`${this.apiUrl}/rooms/${roomId}`, updates);
  }

  // === Message Status Methods ===

  // Get message delivery status
  getMessageStatus(messageId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/messages/${messageId}/status`);
  }

  // Report message as delivered
  markAsDelivered(messageId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/messages/${messageId}/delivered`, {});
  }

  // === Cleanup ===
  ngOnDestroy(): void {
    this.messageSubject.complete();
    this.roomsSubject.complete();
    this.unreadCountSubject.complete();
  }
}
