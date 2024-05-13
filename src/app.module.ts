import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { EssaysModule } from './essays/essays.module';
import { FlashCardsModule } from './flashcard/flashcards.module';
import { BooksModule } from './books/books.module';
import { McqsModule } from './mcqs/mcqs.module';
import { VideosModule } from './videos/videos.module';
import { AudiosModule } from './audios/audios.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { AdminModule } from './admin/admin.module';
import { ContentsModule } from './contents/contents.module';
import { ChatsModule } from './chats/chats.module';
import { NotifModule } from './notificationModule/notifModule';
import { InvitationModule } from './invitationModule/invitationModule';
import { PaymentModule } from './paymentModule/payment.module';
import { ForAdminContentManagement } from './middleware/forAdminContentManagement';
import { ContentsController } from './contents/contents.controller';
// import {CloudinaryStorage} from 'multer-storage-cloudinary'
// MulterModule.registerAsync({
//   useFactory: () => ({
//     // storage: diskStorage({ destination: './videos/videos.module' }),
//     storage: new CloudinaryStorage,
//     limits:{fileSize:1024*1024*50}
//   }),
// }),

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.DB_CONNECTION),
    AdminModule,
    AuthModule,
    CloudinaryModule,
    ContentsModule,
    EssaysModule,
    FlashCardsModule,
    BooksModule,
    McqsModule,
    VideosModule,
    AudiosModule,
    ChatsModule,
    NotifModule,
    InvitationModule,
    PaymentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ForAdminContentManagement)
      // .exclude(
      //   {
      //     path: 'paystack_bvn_validation_webhook_response',
      //     method: RequestMethod.POST,
      //   },
      //   {
      //     path: 'paystack_bvn_identity_validation',
      //     method: RequestMethod.POST,
      //   },
      //   {
      //     path: 'paystack_get_banks',
      //     method: RequestMethod.GET,
      //   },
      // )
      .forRoutes(
        'admin/fetch_all_users/:purpose',
        'admin/fetch_all_subadmins/:purpose',
        'content/create_super_folder',
        'content/add_parent_ids_to_resource',
        'content/remove_parent_ids_from_resource',
        'content/monify_resource',
        'content/unmonify_resource',
      );
  }
}
