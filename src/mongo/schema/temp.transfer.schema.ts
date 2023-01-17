import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { UserWalletDetailDto } from '../dto/user.wallet.detail';

export type TempTransferDocument = HydratedDocument<TempTransferSchema>;

@Schema()
export class TempTransferSchema {
  @Prop({type:String})
  transactionId:string

  @Prop({type:String})
  contract:string

  @Prop({type:String})
  fromAddress:string

  @Prop({type:String})
  toAddress:string

  @Prop({type:String})
  amount:string
}

export const tempTransferSchema = SchemaFactory.createForClass(TempTransferSchema);