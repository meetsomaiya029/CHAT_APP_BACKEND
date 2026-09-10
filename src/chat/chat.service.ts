import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async createRoom(name: string, userId: string) {
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

  async saveMessage(data: { roomId: string; content: string; userId: string }) {
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

  // Updated: Cursor-based Pagination
  async getRoomMessages(roomId: string, cursor?: string, limit: number = 20) {
    const take = Number(limit);

    return this.prisma.message.findMany({
      where: { roomId },
      take: take,
      ...(cursor
        ? {
            skip: 1, // Skip the cursor message itself
            cursor: { id: cursor },
          }
        : {}),
      include: {
        user: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' }, // Order descending to fetch previous history correctly
    }).then((messages) => messages.reverse()); // Reverse array to keep chronological order for client
  }

  // Edit Message
  async updateMessage(messageId: string, content: string, userId: string) {
    const message = await this.prisma.message.findUnique({ where: { id: messageId } });

    if (!message) throw new NotFoundException('Message not found');
    if (message.userId !== userId) throw new ForbiddenException('You can only edit your own messages');

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

  // Delete Message
  async deleteMessage(messageId: string, userId: string) {
    const message = await this.prisma.message.findUnique({ where: { id: messageId } });

    if (!message) throw new NotFoundException('Message not found');
    if (message.userId !== userId) throw new ForbiddenException('You can only delete your own messages');

    return this.prisma.message.delete({
      where: { id: messageId },
    });
  }
}