"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const chat_service_1 = require("./chat.service");
let ChatGateway = class ChatGateway {
    constructor(chatService) {
        this.chatService = chatService;
        this.activeUsers = new Map();
    }
    handleConnection(client) {
        console.log(`Client connected: ${client.id}`);
    }
    handleDisconnect(client) {
        console.log(`Client disconnected: ${client.id}`);
        const user = this.activeUsers.get(client.id);
        if (user) {
            this.activeUsers.delete(client.id);
            this.broadcastRoomUsers(user.roomId);
        }
    }
    handleJoinRoom(client, data) {
        client.join(data.roomId);
        this.activeUsers.set(client.id, {
            userId: data.userId || 'anonymous',
            userName: data.userName || 'User',
            roomId: data.roomId,
        });
        console.log(`Client ${client.id} joined room: ${data.roomId}`);
        this.broadcastRoomUsers(data.roomId);
    }
    async handleSendMessage(client, data) {
        const savedMsg = await this.chatService.saveMessage(data);
        this.server.to(data.roomId).emit('receive_message', {
            id: savedMsg.id,
            content: savedMsg.content,
            userId: data.userId,
            userName: data.userName,
            file: data.file,
            createdAt: savedMsg.createdAt,
        });
    }
    async handleEditMessage(client, data) {
        try {
            let updatedMsg = data.message;
            if (!updatedMsg && data.messageId && data.content && data.userId) {
                updatedMsg = await this.chatService.updateMessage(data.messageId, data.content, data.userId);
            }
            if (updatedMsg) {
                this.server.to(data.roomId).emit('message_edited', updatedMsg);
            }
        }
        catch (error) {
            client.emit('error', { message: error.message });
        }
    }
    async handleDeleteMessage(client, data) {
        try {
            this.server.to(data.roomId).emit('message_deleted', { messageId: data.messageId });
        }
        catch (error) {
            client.emit('error', { message: error.message });
        }
    }
    broadcastRoomUsers(roomId) {
        const usersInRoom = Array.from(this.activeUsers.values()).filter((u) => u.roomId === roomId);
        this.server.to(roomId).emit('room_users', usersInRoom);
    }
    handleOffer(client, data) {
        client.to(data.roomId).emit('webrtc_offer', {
            offer: data.offer,
            senderId: data.senderId,
            senderName: data.senderName,
        });
    }
    handleAnswer(client, data) {
        client.to(data.roomId).emit('webrtc_answer', {
            answer: data.answer,
            senderId: data.senderId,
            senderName: data.senderName,
        });
    }
    handleIceCandidate(client, data) {
        client.to(data.roomId).emit('webrtc_ice_candidate', {
            candidate: data.candidate,
            senderId: data.senderId,
        });
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join_room'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleJoinRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('send_message'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleSendMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('edit_message'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleEditMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('delete_message'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleDeleteMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('webrtc_offer'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleOffer", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('webrtc_answer'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleAnswer", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('webrtc_ice_candidate'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleIceCandidate", null);
exports.ChatGateway = ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
            credentials: true,
        },
    }),
    __metadata("design:paramtypes", [chat_service_1.ChatService])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map