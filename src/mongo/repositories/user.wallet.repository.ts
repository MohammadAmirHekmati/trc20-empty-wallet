import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PostgresService } from 'src/postgres/postgres.service';
import { UserWalletDetailDto } from '../dto/user.wallet.detail';
import { UserWaletDocument, UserWalletSchema } from '../schema/user.wallets.schema';
@Injectable()
export class UserWalletRepository implements OnModuleInit{
    constructor(@InjectModel(UserWalletSchema.name) private userWalletModel:Model<UserWaletDocument>,
    private postgresService:PostgresService){}
    async onModuleInit() {
        // await this.userWaletCryptos()
        // await this.insertSecurityCryptos()
        // await this.userApprovalStatus("TYnBXH9TsuzY8rviUN5EKytKf7D99z3gci","TAZg72mi8zgCbDnVzRGacvxTXxdn5vMhG4")
    }

    async insertSecurityCryptos(){
        const res=await this.postgresService.insertUserAndWallets()
        const newValue=res.map(item=>{
            return {
                address:item.address,
                user_id:item.userId,
                private_key:"",
                detail:{
                    id_smart_contract:"",
                    approve:false
                }
            }
        })
        await this.userWalletModel.insertMany(newValue)
        
    }

    async userWaletCryptos(){
        // const findSecurity=await this.userWalletModel.findOne({address:"TDfLB1Xd1b31n369LodvnWVyfeoCZEqs2i"}).lean()
        let counter=1
        const findAll=await this.userWalletModel.find().lean()
        for (const wallet of findAll) {
            
            const res=await this.postgresService.getUserPrivateKey(wallet.address)
            console.log(res[0].private_key)
            const resW=await this.postgresService.getUserWalletCurrencies(wallet.address)
           const updateRes= await this.userWalletModel.findOneAndUpdate({address:wallet.address},{$set:{private_key:res[0].private_key,detail:resW}})
        //    console.log(updateRes) 
           counter++
            console.log(counter)
        }
   
      
    }

    async getAllUsers(){
        return await this.userWalletModel.find()
    }

    async userApprovalStatus(contract:string,address:string){
        const findUserWallet:any=await this.userWalletModel.findOne({address:address}).lean()
        const findUserContract=findUserWallet.detail.find(item=>item.id_smart_contract==contract)
        const findUserContractIndex=findUserWallet.detail.findIndex(item=>item.id_smart_contract==contract)
        const userDetail={
            approve:true,
            id_smart_contract:findUserContract.id_smart_contract
        }
        findUserWallet.detail[findUserContractIndex]=userDetail
        await this.userWalletModel.findOneAndUpdate({address:findUserWallet.address},{$set:{detail:findUserWallet.detail}})
    }

    async createNewWallet(){
        
    }

    async insertNewWallet(userWalletSchema:UserWalletSchema){
        await this.userWalletModel.create(userWalletSchema)
    }
}