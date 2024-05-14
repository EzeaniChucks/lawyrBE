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
    consumer.apply(ForAdminContentManagement).forRoutes(
      'admin/fetch_all_users/:purpose',
      'admin/fetch_all_subadmins/:purpose',
      'admin/turn_user_to_subadmin',
      'admin/turn_subadmin_to_user',
      'content/add_parent_ids_to_resource',
      'content/remove_parent_ids_from_resource',
      'content/monify_resource',
      'content/unmonify_resource',
      //create
      'contents/create_super_folder',
      'audios/upload_audio',
      'docx_pdfs/upload_docx_pdf',
      'essays/create_essay',
      'flashcards/create_flashcard',
      'mcqs/create_mcq',
      'upload_videos/create_upload_video',
      //update
      'contents/update_single_content',
      'contents/monify_resource',
      'contents/unmonify_resource',
      'audios/replace_single_audio',
      'audios/edit_single_audio_name',
      'audios/edit_audio_details',
      'docx_pdfs/replace_single_docx_pdf',
      'docx_pdfs/edit_single_docx_pdf_name',
      'docx_pdfs/edit_docx_pdf_details',
      'essays/update_essay',
      'flashcards/update_flashcard',
      'mcqs/update_mcq',
      'videos/update_video',
      //delete
      'audios/delete_single_audio',
      'audios/delete_entire_audio_group/:parentaudioId',
      'docx_pdfs/delete_single_docx_pdf',
      'essays/delete_essay/:essayId',
      'flashcards/delete_flashcard/:flashcardId',
      'mcqs/delete_mcq/:mcqId',
      'videos/delete_video/:videoId',
    );
  }
}
