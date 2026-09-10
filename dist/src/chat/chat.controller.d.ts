import { ChatService } from './chat.service';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    getRooms(): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        createdById: string;
    }[]>;
    createRoom(dto: {
        name: string;
        userId?: string;
    }): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        createdById: string;
    }>;
    getMessages(roomId: string, cursor?: string, limit?: number): Promise<({
        user: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        roomId: string;
        content: string;
        isEdited: boolean;
    })[]>;
    updateMessage(messageId: string, content: string, req: any): Promise<{
        user: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        roomId: string;
        content: string;
        isEdited: boolean;
    }>;
    deleteMessage(messageId: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        roomId: string;
        content: string;
        isEdited: boolean;
    }>;
}
