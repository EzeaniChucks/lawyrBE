import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { authSchema } from './auth.model';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
@Module({
  imports: [MongooseModule.forFeature([{ name: 'auth', schema: authSchema }])],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {}
}