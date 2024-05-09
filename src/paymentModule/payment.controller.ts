import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  Body,
  Res,
  Req,
  RawBodyRequest,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { Response, query, response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { ChargeUserWalletDTO, PayStackPaymentResponseDTO } from './payment.dto';

@Controller('wallet')
@ApiTags('Payment')
export class PaymentController {
  constructor(private readonly paymentservice: PaymentService) {}
  //flutterwave
  @Get('response')
  async paymentresponse(
    @Query('transaction_id') transaction_id: string,
    @Query('description') description: string,
  ) {
    return await this.paymentservice.paymentresponse(
      transaction_id,
      description,
    );
  }

  @Post('paystack_payment_response')
  async payStackPaymentResponse(
    @Body()
    body: PayStackPaymentResponseDTO,
    @Res() res: Response,
  ) {
    const { reference } = body;
    return await this.paymentservice.payStackPaymentResponse(
      { reference },
      res,
    );
  }

  //in-app
  @Get('/:userId/get_wallet_balance')
  async getUserBalance(@Param('userId') userId: string, @Res() res: Response) {
    return await this.paymentservice.getUserBalance(userId, res);
  }

  //in-app
  @Post('/charge_user_wallet')
  async chargeWallet(@Body() body: ChargeUserWalletDTO, @Res() res: Response) {
    const { userId, amount } = body;
    return await this.paymentservice.chargeWallet(userId, amount, res);
  }

  //in-app
  @Get('latest_transactions/:userId')
  latestTransactions(@Param('userId') userId: string) {
    return this.paymentservice.latestTransactions(userId);
  }

  //flutterwave
  // @Get('fetch_country_banks/:country')
  // getCountryBanks(@Param('country') country: string, @Res() response: any) {
  //   return this.paymentservice.getCountryBanks(country, response);
  //   // return response.status(200).json({ response: result });
  // }

  // @Post('send_money_to_user')
  // sendMoneyToUser(@Body() body: any, @Res() response: Response) {
  //   const { userId, recipientId, currency, amount } = body;
  //   return this.paymentservice.transferMoneyToUser(
  //     userId,
  //     recipientId,
  //     currency,
  //     amount,
  //     response,
  //   );
  // }

  // @Post('charge_user_as_penalty')
  // async chargeUserAsPenalty(@Body() body: any, @Res() response: any) {
  //   const {
  //     userId,
  //     chargeClientId,
  //     chargeCurrency,
  //     chargeAmount,
  //     chargeHeading,
  //     chargeDescription,
  //   } = body;
  //   return this.paymentservice.chargeUserAsPenalty(
  //     userId,
  //     chargeClientId,
  //     chargeHeading,
  //     chargeDescription,
  //     chargeCurrency,
  //     chargeAmount,
  //     response,
  //   );
  // }
  // @Post('settle_user_penalty')
  // async settleUserPenalty(@Body() body: any, @Res() response: Response) {
  //   const { userId, chargeId, chargeAmount, chargeCurrency } = body;
  //   return this.paymentservice.settleCharge(
  //     userId,
  //     chargeId,
  //     chargeAmount,
  //     chargeCurrency,
  //     response,
  //   );
  // }
}
