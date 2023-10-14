import { Module } from '@nestjs/common';
import { ChatsGateway } from './chats.gateway';
import { ChatsService } from './chats.service';
import { MongooseModule } from '@nestjs/mongoose';
import { chatSchema } from './chats.model';
import { groupTestSchema } from 'src/grouptests/grouptests.model';
import { authSchema } from 'src/auth/auth.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'testchats', schema: chatSchema }]),
    MongooseModule.forFeature([
      { name: 'grouptests', schema: groupTestSchema },
    ]),
    MongooseModule.forFeature([{ name: 'auths', schema: authSchema }]),
  ],
  providers: [ChatsGateway, ChatsService],
  // controllers: [ChatsGateway]
})
export class ChatsModule {}
