import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { UserWalletDetailDto } from '../dto/user.wallet.detail';

export type MainApprovalDocument = HydratedDocument<MainApprovalSchema>;

@Schema()
export class MainApprovalSchema {
  @Prop({type:String})
  transactionId:string

  @Prop({type:String})
  contract:string

  @Prop({type:String})
  system_address:string

  @Prop({type:String})
  user_address:string

  @Prop({type:String})
  time:string
}

export const mainApprovalSchema = SchemaFactory.createForClass(MainApprovalSchema);