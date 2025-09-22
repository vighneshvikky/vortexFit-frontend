

export interface VideoEvents {
  'user-joined': { userId: string; sessionId: string };
  'user-left': { userId: string; sessionId: string };
  'user-approved': { sessionId: string };
  'signal': {
    type: 'offer' | 'answer' | 'ice-candidate' | 'approval' | 'rejection';
    data: RTCSessionDescriptionInit | RTCIceCandidateInit | { message: string };
    sessionId: string;
    from: string;
    to?: string;
  };
}

export interface ChatEvents {
  'message': { from: string; text: string; timestamp: string };

}


export interface NamespaceEvents {
  video: VideoEvents;
  chat: ChatEvents;
}
