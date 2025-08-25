export interface ChatMessage {
    _id?: string;
    senderId: string;
    receiverId: string;
    content: string;
    createdAt: string;  
}