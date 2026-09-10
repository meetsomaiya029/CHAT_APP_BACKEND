import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('rooms')
  getRooms() {
    return this.chatService.getAllRooms();
  }

  @Post('rooms')
  createRoom(@Body() dto: { name: string; userId?: string }) {
    return this.chatService.createRoom(dto.name, dto.userId || 'system');
  }

  // Updated: Supports query parameters for pagination (?cursor=xxx&limit=20)
  @Get('rooms/:id/messages')
  getMessages(
    @Param('id') roomId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: number,
  ) {
    return this.chatService.getRoomMessages(roomId, cursor, limit);
  }

  // Edit Message REST Endpoint
  @Patch('messages/:id')
  updateMessage(
    @Param('id') messageId: string,
    @Body('content') content: string,
    @Req() req: any,
  ) {
    // Assuming JWT user payload is populated on req.user; falls back to body userId if needed
    const userId = req.user?.id || req.body?.userId;
    return this.chatService.updateMessage(messageId, content, userId);
  }

  // Delete Message REST Endpoint
  @Delete('messages/:id')
  deleteMessage(@Param('id') messageId: string, @Req() req: any) {
    const userId = req.user?.id || req.body?.userId;
    return this.chatService.deleteMessage(messageId, userId);
  }
}