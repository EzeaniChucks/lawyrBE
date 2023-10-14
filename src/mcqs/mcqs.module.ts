import { Module } from '@nestjs/common';
import { McqsController } from './mcqs.controller';
import { McqsService } from './mcqs.service';
import { MongooseModule } from '@nestjs/mongoose';
import { mcqSchema } from './mcq.model';
import { contentsSchema } from 'src/contents/contents.model';
import { groupTestSchema } from 'src/grouptests/grouptests.model';
import { authSchema } from 'src/auth/auth.model';
import { NotifModule } from 'src/notificationModule/notifModule';
import { InvitationModule } from 'src/invitationModule/invitationModule';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'auth', schema: authSchema }]),
    MongooseModule.forFeature([{ name: 'mcqs', schema: mcqSchema }]),
    MongooseModule.forFeature([{ name: 'contents', schema: contentsSchema }]),
    MongooseModule.forFeature([
      { name: 'grouptests', schema: groupTestSchema },
    ]),
    NotifModule,
    InvitationModule,
  ],
  controllers: [McqsController],
  providers: [McqsService],
  exports: [McqsService],
})
export class McqsModule {}
