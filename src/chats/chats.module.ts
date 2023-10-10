import { Module } from '@nestjs/common';
import { ChatsGateway } from './chats.gateway';
import { ChatsService } from './chats.service';
import { MongooseModule } from '@nestjs/mongoose';
import { chatSchema } from './chats.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'testchats', schema: chatSchema }]),
  ],
  providers: [ChatsGateway, ChatsService],
  // controllers: [ChatsGateway]
})
export class ChatsModule {}
