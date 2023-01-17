import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { MainApprovalSchema, MainApprovalDocument } from "../schema/approval.main.schema";
import { TempApprovalDocument, TempApprovalSchema } from "../schema/temp.approval.schema";

@Injectable()
export class TempApprovalRepository{
    constructor(@InjectModel(TempApprovalSchema.name) private tempApprovalModel:Model<TempApprovalDocument>,
    @InjectModel(MainApprovalSchema.name) private mainApprovalModel:Model<MainApprovalDocument>){}

    async createTempApprovalSchema(createTempApprovalDto:TempApprovalSchema){
        return await this.tempApprovalModel.create(createTempApprovalDto)
    }

    async findAllTempApprovals(){
        return await this.tempApprovalModel.find().sort({["timeStamp"]:"asc"}).limit(100).lean()
    }

    async deleteTempApproval(transactionId:string){
        await this.tempApprovalModel.findOneAndDelete({transactionId:transactionId})
    }

    async checkDuplicateApprove(address:string,contract:string){
        return await this.tempApprovalModel.findOne({user_address:address,contract:contract}).lean()
    }

    async createMainApproval(mainApproval:MainApprovalSchema){
        await this.mainApprovalModel.create(mainApproval)
    }
}