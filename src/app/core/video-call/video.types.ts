// video.types.ts
export interface UserJoinedPayload {
  userId: string;
  sessionId: string;
}

export interface UserLeftPayload {
  userId: string;
  sessionId: string;
}

export interface UserApprovedPayload {
  sessionId: string;
}

export type SignalPayload = {
  type: 'offer' | 'answer' | 'ice-candidate' | 'approval' | 'rejection';
  data: {message: string}
  sessionId: string;
  from: string;
  to?: string;
};
