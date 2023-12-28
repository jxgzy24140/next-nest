/* eslint-disable @typescript-eslint/no-unused-vars */
// socket.gateway.ts
import { Server, Socket } from 'socket.io';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { AuthService } from './auth/auth.service';
import e from 'express';
@WebSocketGateway({ cors: true })
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private rooms: Map<string, string[]> = new Map();
  private admins: Map<string, string[]> = new Map();

  constructor(private authService: AuthService) {}

  afterInit(socket: Socket) {}

  async handleConnection(socket: Socket) {
    const authHeader = socket.handshake.headers.authorization;
    if (authHeader && (authHeader as string)?.split(' ')[1]) {
      try {
        const decodedToken: any = await this.authService.handleVerifyToken(
          (authHeader as string).split(' ')[1],
        );
        socket.data.email = decodedToken.email;

        if (decodedToken.role === 0) {
          this.admins.set('adminRoom', [decodedToken.email]);
          socket.join('adminRoom');
        }
      } catch (error) {
        socket.disconnect();
      }
    } else {
      socket.disconnect();
    }
  }

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    console.log('[Disconnection] socketid: ', socket.id);
    console.log('[Disconnection] email: ', socket.data.email);
  }

  private handleEmitMessage({ data, event, to }: any) {
    console.log('[handleEmitMessage] data: ', data);
    console.log('[handleEmitMessage] event: ', event);
    console.log('[handleEmitMessage] to: ', to);
    if (to) {
      this.server.to(to).emit(event, data);
    } else {
      this.server.emit(event, data);
    }
  }

  @SubscribeMessage('message')
  handleMessage(@MessageBody() payload, @ConnectedSocket() socket: Socket) {
    console.log('[message] data: ', payload.data);
    console.log('[message] event: ', payload.event);
    console.log('[message] to: ', payload.to);
    // this.handleEmitMessage({
    //   data: payload.data,
    //   event: payload.event,
    //   to: payload.to,
    // });
    this.server
      .to(payload.to)
      .emit(payload.event, `${socket.data.email} ${payload.data}`);
  }

  @SubscribeMessage('createRoom')
  handleCreateRoom(socket: Socket, roomName: string) {
    console.log('[createRoom] roomName: ', roomName);
    socket.join(roomName);
    this.server.to('adminRoom').emit('newConversation', {
      roomName: roomName,
      email: socket.data.email,
    });
    // this.rooms.set(roomName, [socket.data.email]);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(socket: Socket, id: any) {
    console.log('[joinRoom] roomName: ', id);
    socket.join(id);

    this.server.to(id).emit('joinedTheChat', socket.data.email);
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(socket: Socket, id: any) {
    console.log('[leaveRoom] roomName: ', id);
    socket.leave(id);
    this.server.to(id).emit('leaveTheChat', socket.data.email);
  }
}
