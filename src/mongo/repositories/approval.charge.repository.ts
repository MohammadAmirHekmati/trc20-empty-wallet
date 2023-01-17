import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ApprovalChargeDocument, ApprovalChargeSchema } from '../schema/approval.charge.schema';
@Injectable()
export class ApprovalChargeRepository{
        constructor(@InjectModel(ApprovalChargeSchema.name) private approvalChargeModel:Model<ApprovalChargeDocument>){}

        async createApprovalCharge(approvalCharge:ApprovalChargeSchema){
            await this.approvalChargeModel.create(approvalCharge)
        }

        async findApprovalCharge(address:string,contract:string){
            return await this.approvalChargeModel.findOne({address:address,contract:contract}).lean()
        }
}