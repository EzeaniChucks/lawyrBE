import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { authSchema } from './auth.model';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { contentsSchema } from 'src/contents/contents.model';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'auths', schema: authSchema }]),
    MongooseModule.forFeature([{ name: 'contents', schema: contentsSchema }]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {}
}
