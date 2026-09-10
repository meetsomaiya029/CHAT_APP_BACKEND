import { PrismaService } from '../prisma/prisma.service';
export declare class ChatService {
    private prisma;
    constructor(prisma: PrismaService);
    createRoom(name: string, userId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        createdById: string;
    }>;
    getAllRooms(): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        createdById: string;
    }[]>;
    saveMessage(data: {
        roomId: string;
        content: string;
        userId: string;
    }): Promise<{
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
    getRoomMessages(roomId: string, cursor?: string, limit?: number): Promise<({
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
    updateMessage(messageId: string, content: string, userId: string): Promise<{
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
    deleteMessage(messageId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        roomId: string;
        content: string;
        isEdited: boolean;
    }>;
}
