import { MainApprovalSchema } from './../mongo/schema/approval.main.schema';
import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { Job, Queue } from 'bull';
import { Configs } from 'src/configs';
import { ApprovalChargeRepository } from 'src/mongo/repositories/approval.charge.repository';
import { TempApprovalRepository } from 'src/mongo/repositories/temp.approval.repository';
import { TempTransferRepository } from 'src/mongo/repositories/temp.transfer.repository';
import { Trc20EmptyWalletRepository } from 'src/mongo/repositories/trc20.empty.wallet.repository';
import { UserWalletRepository } from 'src/mongo/repositories/user.wallet.repository';
import { ApprovalChargeSchema } from 'src/mongo/schema/approval.charge.schema';
import { TempApprovalSchema } from 'src/mongo/schema/temp.approval.schema';
import { TempTransferSchema } from 'src/mongo/schema/temp.transfer.schema';
import { UserWalletSchema } from 'src/mongo/schema/user.wallets.schema';
import { PostgresService } from 'src/postgres/postgres.service';
import { ApproveDto } from 'src/tron/dto/approve.dto';
import { TransferTrc20FromDto } from 'src/tron/dto/transfer.from.dto';
import { TronService } from 'src/tron/tron.service';
import { WalletJobDto } from './dto/wallets.job.dto';
import { ProcessEnum } from './enums/process.enum';
import { QueueEnum } from './enums/queue.enum';

@Processor(QueueEnum.QUEUE_BOT_TRON_TRC20)
@Injectable()
export class EmptyWalletService implements OnModuleInit {
    userWallets:UserWalletSchema[]=[]
    constructor(private trc20EmptyWalletRepository:Trc20EmptyWalletRepository,
        private userWalletRepository:UserWalletRepository,
        private tronService:TronService,
        private tempApprovalRepository:TempApprovalRepository,
        private tempTransferRepository:TempTransferRepository,
        private postgresService:PostgresService,
        private approvalChargeRepository:ApprovalChargeRepository,
        @InjectQueue(QueueEnum.QUEUE_BOT_TRON_TRC20) private trc20Queue: Queue){}
    
        async onModuleInit() {
        const wallets=await this.userWalletRepository.getAllUsers()
        this.userWallets=this.userWallets.concat(wallets)
        }

    @Interval(20000)
    async checkEmptyTransactions(){
        try {
        const allConfirmedTx=await this.trc20EmptyWalletRepository.getAllTempTransactions()
        console.log("----------- empty wallet tx count ----------")
        console.log(allConfirmedTx.length)
        for (const tx of allConfirmedTx) {
            const findUser=this.userWallets.find(item=>{
                if(item.address==tx.toAddress && item.user_id==tx.userId)
                return item
            })
            const checkApprove=findUser.detail.find(item=>item.id_smart_contract==tx.smart_contract)
            if(checkApprove.approve)
            {
                // Do Transfer From
                const transferFrom:TransferTrc20FromDto={
                    amount:Number(tx.amount),
                    from_address:tx.toAddress,
                    private_key:Configs.masterWallets[1].privateKey,
                    target_address:Configs.masterWallets[1].address,
                    smart_contract:tx.smart_contract
                }
                const transferResult=await this.tronService.transferFrom(transferFrom)
                if(!transferFrom)
                continue

                if(transferFrom){
                const tempTransferFrom:TempTransferSchema={
                    amount:transferFrom.amount.toString(),
                    contract:transferFrom.smart_contract,
                    fromAddress:transferFrom.from_address,
                    toAddress:transferFrom.target_address,
                    transactionId:transferResult
                }
                await this.tempTransferRepository.createTempTransfer(tempTransferFrom)
                await this.trc20EmptyWalletRepository.deleteConfirmedTempTransaction(tx.transactionId)
            }
            }

            if(!checkApprove.approve)
            {
                const checkUserApproval=await this.tempApprovalRepository.checkDuplicateApprove(findUser.address,checkApprove.id_smart_contract)
                if(!checkUserApproval)
                {

                const checkForApproveCharge=await this.approvalChargeRepository.findApprovalCharge(findUser.address,checkApprove.id_smart_contract)
                if(!checkForApproveCharge)
                {
                    const transferFromResult=await this.tronService.transferCoin({amount:Configs.tron.amountChargeForApprove,from_address:Configs.masterWallets[0].address,private_key:Configs.masterWallets[0].privateKey,
                    to_address:findUser.address})
                    if(!transferFromResult)
                    continue
                    
                const approvalCharge:ApprovalChargeSchema={
                    address:findUser.address,
                    amount:Configs.tron.amountChargeForApprove,
                    contract:checkApprove.id_smart_contract,
                    transactionId:transferFromResult
                }
                await this.approvalChargeRepository.createApprovalCharge(approvalCharge)
                }
                
                if(checkForApproveCharge)
                {
                const checkTransactionResult=await this.tronService.checkTransaction(checkForApproveCharge.transactionId)
                
                    if(checkTransactionResult.contractRet=='SUCCESS' && checkTransactionResult.confirmed)
                    {
                    const approveUser:ApproveDto={
                        contract_address:tx.smart_contract,
                        system_address:Configs.masterWallets[1].address,
                        user_private_key:findUser.private_key
                    }
                    const resultApprove=await this.tronService.approval(approveUser)
                    const tempApprove:TempApprovalSchema={
                        contract:tx.smart_contract,
                        system_address:Configs.masterWallets[0].address,
                        transactionId:resultApprove,
                        user_address:findUser.address,
                        time:new Date().getTime().toString()
                    }
                    await this.tempApprovalRepository.createTempApprovalSchema(tempApprove)
                     }
                }
            }
            }
        }
        } catch (e) {
            console.log("--------- why error koshte shod --------")
            console.log(e)
        }
    }

    @Interval(10000)
    async checkTempApprove(){
        try {
            // console.log("---------- checking approvals ------------")
        const findAllTemp=await this.tempApprovalRepository.findAllTempApprovals()
        console.log("------------ temp approves -----------")
        console.log(findAllTemp.length)
        for (const tempApprove of findAllTemp) {
            // const date=new Date().getTime()/600
            // const tempDate=new Date().getTime()/600
            // const diffrentBetween=date-tempDate
            const checkResult=await this.tronService.checkTransaction(tempApprove.transactionId)
            if(checkResult.contractRet=='SUCCESS' && checkResult.confirmed)
            {
                // TODO
                // Update User Approve In Postgres
                await this.userWalletRepository.userApprovalStatus(tempApprove.contract,tempApprove.user_address)
                
                await this.postgresService.updateUserApproveStatus(tempApprove.user_address,tempApprove.contract)
                const mainApprove:MainApprovalSchema={
                    contract:tempApprove.contract,
                    system_address:tempApprove.system_address,
                    time:tempApprove.time,
                    transactionId:tempApprove.transactionId,
                    user_address:tempApprove.user_address
                }
                await this.tempApprovalRepository.createMainApproval(mainApprove)
                await this.tempApprovalRepository.deleteTempApproval(tempApprove.transactionId)
            }

            if(checkResult.contractRet!=='SUCCESS' ||  !checkResult.confirmed)
            {
                
            }
        }
        } catch (e) {
            
        }
    }

    @Interval(10000)
    async checkTempTransactions(){
        const checkTempTransfers=await this.tempTransferRepository.getAllTempTransfers()
        console.log("------------ check temp transfer -----------")
        console.log(checkTempTransfers.length)
        for (const tempTransfer of checkTempTransfers) {
            const checkResult=await this.tronService.checkTransaction(tempTransfer.transactionId)
            if(checkResult.contractRet=='SUCCESS' && checkResult.confirmed)
            {
             await this.tempTransferRepository.deleteByTransactionId(tempTransfer.transactionId)
            }
        }
    }

    @Process(ProcessEnum.generatedAddresses)
    async handleCreatedAddress(job:Job<WalletJobDto>){
        const walletDetail=await this.postgresService.getSmartAndApproveForAddress(job.data.address)
        const userWallet:UserWalletSchema={
            address:job.data.address,
            user_id:job.data.user_id,
            private_key:job.data.private_key,
            detail:walletDetail
        }
        await this.userWalletRepository.insertNewWallet(userWallet)

    }
    
}
