import { ApiProperty } from '@nestjs/swagger';

export class PayStackPaymentResponseDTO {
  @ApiProperty({ example: 'paystack-reference' })
  reference: string;
}

export class ChargeUserWalletDTO {
  @ApiProperty({ example: 'mongooseGeneratedId' })
  userId: string;

  @ApiProperty({ example: 20 })
  amount: number;

  @ApiProperty({ example: 20 })
  purpose?: string;
}
export class FundUserWalletDTO {
  @ApiProperty({ example: 'mongooseGeneratedId' })
  userId: string;

  @ApiProperty({ example: 20 })
  amount: number;

  @ApiProperty({ example: 'Your reason fo r why wallet is charged' })
  purpose: string;
}
