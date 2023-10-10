import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { notificationSchema } from './notifModel';
import { NotifController } from './notifController';
import { NotifService } from './notifService';
import { groupTestSchema } from 'src/grouptests/grouptests.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'notifications', schema: notificationSchema },
    ]),
    MongooseModule.forFeature([
      { name: 'grouptests', schema: groupTestSchema },
    ]),
  ],
  controllers: [NotifController],
  providers: [NotifService],
})
export class NotifModule {}
