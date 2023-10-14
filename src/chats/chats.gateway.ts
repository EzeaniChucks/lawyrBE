import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatsService } from './chats.service';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class ChatsGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatsService: ChatsService) {}

  @SubscribeMessage('createMessage')
  async create(
    @MessageBody() createMessageDto: any,
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.chatsService.create(createMessageDto);
    this.server.in(createMessageDto.grouptestId).emit('message', message);
    return message;
  }

  @SubscribeMessage('findAllMessages')
  findAll(@MessageBody() paylood: any) {
    return this.chatsService.findAll(paylood?.grouptestId);
  }

  @SubscribeMessage('join')
  async joinRoom(@MessageBody() payload, @ConnectedSocket() client: Socket) {
    client.join(payload?.grouptestId);
    const usersArray = this.chatsService.identify(
      payload?.name,
      payload?.userId,
      client?.id,
      payload?.grouptestId, //roomId
    );
    // console.log(usersArray);
    // return usersArray;
    this.server.in(payload.grouptestId).emit('joined', usersArray);
  }
  @SubscribeMessage('typing')
  async typing(@MessageBody() body: any, @ConnectedSocket() client: Socket) {
    const name = await this.chatsService.getClientName(
      client.id,
      body.grouptestId,
    );
    client.broadcast
      .to(body.grouptestId)
      .emit('typing', { name, isTyping: body.isTyping });
    }
    
    @SubscribeMessage('start_group_test')
    async startGroupTest(
      @MessageBody() body: { grouptestId: string; creatorId: string },
      @ConnectedSocket() client: Socket,
      ) {
        const { grouptestId, creatorId } = body;
        const result = await this.chatsService.startGroupTest(
          grouptestId,
          creatorId,
          );
  
          this.server.in(grouptestId).emit('group_test_started', result);
          client.to(body.grouptestId)
            .emit('group_test_started', result);
        }

  @SubscribeMessage('disconnect')
  async handleDisconnect(client: Socket) {
    const userObj = this.chatsService.removeClientFromRoom(client.id);
    client.broadcast
      .to(userObj?.grouptestId)
      .emit('someoneDisconnect', userObj?.newUsers);
  }

  // @SubscribeMessage('findOneMessage')
  // findOne(@MessageBody() id: number) {
  //   return this.chatsService.findOne(id);
  // }

  // @SubscribeMessage('updateMessage')
  // update(@MessageBody() updateMessageDto: UpdateMessageDto) {
  //   return this.chatsService.update(updateMessageDto.id, updateMessageDto);
  // }

  // @SubscribeMessage('removeMessage')
  // remove(@MessageBody() id: number) {
  //   return this.chatsService.remove(id);
  // }
}
