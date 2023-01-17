import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type Trc20EmptyWalletDocument = HydratedDocument<Trc20EmptyWalletSchema>;

@Schema()
export class Trc20EmptyWalletSchema {
  @Prop({required:true})
  fromAddress: string;

  @Prop({type:String,required:true})
  toAddress:string

  @Prop({type:String,required:true})
  transactionId:string

  @Prop({type:String,required:true})
  amount:string

  @Prop({required:true})
  userId: string;

  @Prop({required:true})
  smart_contract: string;
}

export const trc20EmptyWalletSchema = SchemaFactory.createForClass(Trc20EmptyWalletSchema);