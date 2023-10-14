import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { invitationSchema } from './invitationModel';
import { InvitationController } from './invitationController';
import { InvitationService } from './invitationService';
import { groupTestSchema } from 'src/grouptests/grouptests.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'invitations', schema: invitationSchema },
    ]),
    MongooseModule.forFeature([
      { name: 'grouptests', schema: groupTestSchema },
    ]),
  ],
  controllers: [InvitationController],
  providers: [InvitationService],
  exports: [InvitationService],
})
export class InvitationModule {}
