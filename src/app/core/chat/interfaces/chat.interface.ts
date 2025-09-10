// chat.interface.ts
export interface ChatMessage {
  _id?: string;
  content: string;
  senderId: string;
  receiverId: string;
  roomId: string;
  timestamp: Date;
  messageType?: 'text' | 'image' | 'file';
  isRead?: boolean;
  isDelivered?: boolean;
  senderName?: string;
  senderImage?: string;
}

export interface ChatRoom {
  _id: string;
  participants: string[];
  lastMessage?: ChatMessage;
  unreadCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TypingUser {
  userId: string;
  userName: string;
  roomId: string;
}

export interface OnlineStatus {
  userId: string;
  isOnline: boolean;
  lastSeen?: Date;
}