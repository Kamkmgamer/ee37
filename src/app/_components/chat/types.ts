export interface MessageMedia {
  id: string;
  mediaUrl: string;
  mediaType: "image" | "video";
}

export interface MessageReaction {
  id: string;
  userId: string;
  reactionType:
    | "like"
    | "dislike"
    | "heart"
    | "angry"
    | "laugh"
    | "wow"
    | "sad";
  messageId: string;
  createdAt: Date;
}

export interface Message {
  id: string;
  content: string | null;
  createdAt: Date;
  updatedAt: Date | null;
  senderId: string;
  senderName: string | null;
  senderAvatar: string | null;
  media: MessageMedia[];
  reactions: MessageReaction[];
  replyTo:
    | {
        id: string;
        content: string | null;
        senderName: string | null;
      }
    | null
    | undefined;
  isForwarded: boolean;
}
