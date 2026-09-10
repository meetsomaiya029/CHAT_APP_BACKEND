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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ChatService = class ChatService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createRoom(name, userId) {
        return this.prisma.room.create({
            data: {
                name,
                createdById: userId,
                members: {
                    create: { userId },
                },
            },
        });
    }
    async getAllRooms() {
        return this.prisma.room.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }
    async saveMessage(data) {
        return this.prisma.message.create({
            data: {
                content: data.content,
                roomId: data.roomId,
                userId: data.userId,
            },
            include: {
                user: { select: { id: true, name: true } },
            },
        });
    }
    async getRoomMessages(roomId, cursor, limit = 20) {
        const take = Number(limit);
        return this.prisma.message.findMany({
            where: { roomId },
            take: take,
            ...(cursor
                ? {
                    skip: 1,
                    cursor: { id: cursor },
                }
                : {}),
            include: {
                user: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
        }).then((messages) => messages.reverse());
    }
    async updateMessage(messageId, content, userId) {
        const message = await this.prisma.message.findUnique({ where: { id: messageId } });
        if (!message)
            throw new common_1.NotFoundException('Message not found');
        if (message.userId !== userId)
            throw new common_1.ForbiddenException('You can only edit your own messages');
        return this.prisma.message.update({
            where: { id: messageId },
            data: {
                content,
                isEdited: true,
            },
            include: {
                user: { select: { id: true, name: true } },
            },
        });
    }
    async deleteMessage(messageId, userId) {
        const message = await this.prisma.message.findUnique({ where: { id: messageId } });
        if (!message)
            throw new common_1.NotFoundException('Message not found');
        if (message.userId !== userId)
            throw new common_1.ForbiddenException('You can only delete your own messages');
        return this.prisma.message.delete({
            where: { id: messageId },
        });
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ChatService);
//# sourceMappingURL=chat.service.js.map