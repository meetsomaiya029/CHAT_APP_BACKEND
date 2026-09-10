import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';


@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private activeUsers = new Map<string, { userId: string; userName: string; roomId: string }>();

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);

    const user = this.activeUsers.get(client.id);
    if (user) {
      this.activeUsers.delete(client.id);
      this.broadcastRoomUsers(user.roomId);
    }
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; userId?: string; userName?: string },
  ) {
    client.join(data.roomId);

    this.activeUsers.set(client.id, {
      userId: data.userId || 'anonymous',
      userName: data.userName || 'User',
      roomId: data.roomId,
    });

    console.log(`Client ${client.id} joined room: ${data.roomId}`);
    this.broadcastRoomUsers(data.roomId);
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { roomId: string; content: string; userId: string; userName: string; file?: any },
  ) {
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

  // --- REAL-TIME EDIT & DELETE HANDLERS ---

// chat.gateway.ts
// --- REAL-TIME EDIT & DELETE HANDLERS ---

@SubscribeMessage('edit_message')
async handleEditMessage(
  @ConnectedSocket() client: Socket,
  @MessageBody() data: { roomId: string; messageId?: string; content?: string; userId?: string; message?: any },
) {
  try {
    let updatedMsg = data.message;

    // If client sent message object instead of individual fields via socket fallback
    if (!updatedMsg && data.messageId && data.content && data.userId) {
      updatedMsg = await this.chatService.updateMessage(
        data.messageId,
        data.content,
        data.userId,
      );
    }

    if (updatedMsg) {
      // Broadcast updated message to everyone in the room (including other peers)
      this.server.to(data.roomId).emit('message_edited', updatedMsg);
    }
  } catch (error) {
    client.emit('error', { message: error.message });
  }
}


@SubscribeMessage('delete_message')
async handleDeleteMessage(
  @ConnectedSocket() client: Socket,
  @MessageBody() data: { roomId: string; messageId: string; userId?: string },
) {
  try {
    // Note: Database deletion is already handled by the REST API call, 
    // but we broadcast the deletion event so other connected users instantly update their UI.
    this.server.to(data.roomId).emit('message_deleted', { messageId: data.messageId });
  } catch (error) {
    client.emit('error', { message: error.message });
  }
}

  // --- HELPER METHODS ---

  private broadcastRoomUsers(roomId: string) {
    const usersInRoom = Array.from(this.activeUsers.values()).filter(
      (u) => u.roomId === roomId,
    );
    this.server.to(roomId).emit('room_users', usersInRoom);
  }

  // --- WEBRTC SIGNALING HANDLERS ---

  @SubscribeMessage('webrtc_offer')
  handleOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; offer: any; senderId: string; senderName?: string },
  ) {
    client.to(data.roomId).emit('webrtc_offer', {
      offer: data.offer,
      senderId: data.senderId,
      senderName: data.senderName,
    });
  }

  @SubscribeMessage('webrtc_answer')
  handleAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; answer: any; senderId: string; senderName?: string },
  ) {
    client.to(data.roomId).emit('webrtc_answer', {
      answer: data.answer,
      senderId: data.senderId,
      senderName: data.senderName,
    });
  }

  @SubscribeMessage('webrtc_ice_candidate')
  handleIceCandidate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; candidate: any; senderId: string },
  ) {
    client.to(data.roomId).emit('webrtc_ice_candidate', {
      candidate: data.candidate,
      senderId: data.senderId,
    });
  }
}