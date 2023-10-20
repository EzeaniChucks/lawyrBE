import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  transactionSchema,
  walletSchema,
  walletTransactionSchema,
} from './payment.model';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { authSchema } from 'src/auth/auth.model';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'walletTransaction', schema: walletTransactionSchema },
    ]),
    MongooseModule.forFeature([
      { name: 'transaction', schema: transactionSchema },
    ]),
    MongooseModule.forFeature([{ name: 'wallet', schema: walletSchema }]),
    MongooseModule.forFeature([{ name: 'auths', schema: authSchema }]),
    // forwardRef(() => AuthModule),
    AuthModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
