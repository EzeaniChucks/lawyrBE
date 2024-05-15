import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { authSchema } from './auth.model';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { contentsSchema } from 'src/contents/contents.model';
import { PaymentModule } from 'src/paymentModule/payment.module';
import { groupTestSchema } from 'src/grouptests/grouptests.model';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'auths', schema: authSchema }]),
    MongooseModule.forFeature([{ name: 'contents', schema: contentsSchema }]),
    PaymentModule,
    MongooseModule.forFeature([
      { name: 'grouptests', schema: groupTestSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {}
}
