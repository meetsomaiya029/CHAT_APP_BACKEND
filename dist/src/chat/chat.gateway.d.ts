import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly chatService;
    server: Server;
    private activeUsers;
    constructor(chatService: ChatService);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoinRoom(client: Socket, data: {
        roomId: string;
        userId?: string;
        userName?: string;
    }): void;
    handleSendMessage(client: Socket, data: {
        roomId: string;
        content: string;
        userId: string;
        userName: string;
        file?: any;
    }): Promise<void>;
    handleEditMessage(client: Socket, data: {
        roomId: string;
        messageId?: string;
        content?: string;
        userId?: string;
        message?: any;
    }): Promise<void>;
    handleDeleteMessage(client: Socket, data: {
        roomId: string;
        messageId: string;
        userId?: string;
    }): Promise<void>;
    private broadcastRoomUsers;
    handleOffer(client: Socket, data: {
        roomId: string;
        offer: any;
        senderId: string;
        senderName?: string;
    }): void;
    handleAnswer(client: Socket, data: {
        roomId: string;
        answer: any;
        senderId: string;
        senderName?: string;
    }): void;
    handleIceCandidate(client: Socket, data: {
        roomId: string;
        candidate: any;
        senderId: string;
    }): void;
}
