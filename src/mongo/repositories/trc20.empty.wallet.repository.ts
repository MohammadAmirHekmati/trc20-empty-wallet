import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Trc20EmptyWalletDocument, Trc20EmptyWalletSchema } from '../schema/trc20.empty.wallet.schema';
@Injectable()
export class Trc20EmptyWalletRepository{
    constructor(@InjectModel(Trc20EmptyWalletSchema.name) private trc20EmptyWalletModel: Model<Trc20EmptyWalletDocument>){}

    async getAllTempTransactions(){
        return await this.trc20EmptyWalletModel.find().sort({["timeStamp"]:"asc"}).limit(100).lean()
    }

    async deleteConfirmedTempTransaction(transactionId:string){
        await this.trc20EmptyWalletModel.findOneAndDelete({transactionId:transactionId})
    }
}