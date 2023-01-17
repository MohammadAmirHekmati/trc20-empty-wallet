import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { UserWalletDetailDto } from '../dto/user.wallet.detail';

export type UserWaletDocument = HydratedDocument<UserWalletSchema>;

@Schema()
export class UserWalletSchema {
  @Prop({required:true,type:String})
  address: string;

  @Prop({required:true,type:String})
  user_id: string;

  @Prop({required:false,type:String})
  private_key: string;

  @Prop([raw({
    id_smart_contract:{type:String},
    approve:{type:Boolean}
  })])
  detail: UserWalletDetailDto[];
}

export const userWalletSchema = SchemaFactory.createForClass(UserWalletSchema);