import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { TempTransferDocument, TempTransferSchema } from "../schema/temp.transfer.schema";

@Injectable()
export class TempTransferRepository{
    constructor(@InjectModel(TempTransferSchema.name) private tempTransferModel:Model<TempTransferDocument>){}

    async createTempTransfer(tempTransfer:TempTransferSchema){
        return await this.tempTransferModel.create(tempTransfer)
    }

    async getAllTempTransfers(){
        return await this.tempTransferModel.find().sort({["timeStamp"]:"asc"}).limit(100).lean()
    }

    async deleteByTransactionId(transactionId:string){
        await this.tempTransferModel.findOneAndDelete({transactionId:transactionId})
    }
}