import { Injectable, OnModuleInit } from '@nestjs/common';
import { Configs } from 'src/configs';
import { ApproveDto } from './dto/approve.dto';
import { CheckTransactionDto } from './dto/check.transaction.dto';
const sdk = require('api')('@tron/v4.6.0#36xrk2lbg6wico');
const TronWeb =require ("tronweb");
const axios=require("axios")
const bigDecimal=require('js-big-decimal');
import { TransferTrc20FromDto } from './dto/transfer.from.dto';
import { Console } from 'console';
import { TransferCoinDto } from './dto/transfer.coin.dto';

@Injectable()
export class TronService implements OnModuleInit{
    tronWeb
    trongridTronweb
    constructor(){
        this.tronWeb = new TronWeb({
            // fullHost: `https://api.trongrid.io`,
            // headers: { "TRON-PRO-API-KEY": `1206fdf8-137f-437f-8940-d0b24aee4827` }
            fullNode:"http://192.168.35.240:8090",
            solidityNode:"http://192.168.35.240:8091"
          });

          this.trongridTronweb = new TronWeb({
            fullHost: `https://api.trongrid.io`,
            headers: { "TRON-PRO-API-KEY": `a1dd6f88-4bc2-4626-918b-5528198d2f4f` }
          })
    }
  async onModuleInit() {
    // await this.getBalanceCoin("TKtTie43DwjhZ5a84iqfuK5dw8wvx3XihP")
    await this.getCurrentBlock()
  }

    async approveUser(){
      const approveResult=await sdk.triggersmartcontract({
            owner_address: '41D1E7A6BC354106CB410E65FF8B181C600FF14292',
            contract_address: '41a7837ce56da0cbb28f30bcd5bff01d4fe7e4c6e3',
            function_selector: 'approve(address spender, uint256 value)',
            call_value: 0
          })

    }

    async approval(approvalDto:ApproveDto):Promise<string>{
        try {
          this.tronWeb.setPrivateKey(approvalDto.user_private_key);
          let contract = await this.tronWeb.contract().at(approvalDto.contract_address);
    
          let result  = await contract.approve(  approvalDto.system_address, Configs.tron.approveMaxUnit).send({  feeLimit: 10000000 })
          return result
        } catch (e) {
          console.log("------------ aproval error --------")
          console.log(e)
        }
      }

      async checkTransaction(hash:string):Promise<CheckTransactionDto>{
        const res=await axios.get(`https://apilist.tronscan.org/api/transaction-info?hash=${hash}`)
        const data:CheckTransactionDto=res.data
        
        return data
      }

      async transferFrom(transferTrc20FromDto: TransferTrc20FromDto): Promise<string> {
        try {
          let ratio=0
          this.tronWeb.setPrivateKey(transferTrc20FromDto.private_key);
          let contract = await this.tronWeb.contract().at(transferTrc20FromDto.smart_contract);
          const decimal = await contract.methods.decimals().call();
          if (decimal==0) ratio=1; else
          if (decimal==1) ratio=10 ; else
            ratio=(Math.pow(10,decimal))
          let result  = await contract.transferFrom(
            transferTrc20FromDto.from_address ,
            transferTrc20FromDto.target_address ,
            Number (bigDecimal.multiply(transferTrc20FromDto.amount , ratio)) //amount
          ).send({  feeLimit: 10000000 })
          return result
        } catch (e) {
          console.log("--------- transfer token from ---------")
          console.log(e)
        }
      }

      async getBalanceCoin(address: any): Promise<any> {
        try {
          const resultBalance = await this.tronWeb.trx.getBalance(address);
          const res=bigDecimal.divide(resultBalance,1000000,6)
          console.log(res)
          return res
        } catch (e) {
          // const result = await HandlerError.errorHandler(e);
          // await this.handlerService.handlerException400("FA", result);
    
        }
      }

      async transferCoin( transferCoinDto : TransferCoinDto) :Promise<string>{
        try {
    
          let  tradeObj = await this.tronWeb.transactionBuilder.sendTrx(
            transferCoinDto.to_address, bigDecimal.multiply(transferCoinDto.amount , Math.pow(10 , 6)) ,
            transferCoinDto.from_address );
          const signedTransaction = await this.tronWeb.trx.sign(
            tradeObj,   transferCoinDto.private_key );
          const receipt = await this.tronWeb.trx.sendRawTransaction( signedTransaction  );
          if (receipt.code) {
            throw new Error(`${receipt.code}`)
          }
          return receipt.txid
        } catch (e) {
          console.log("-------- transfer coin --------")
          console.log(e)
        }
      }

      async getCurrentBlock(){
        console.log("------------------- current block ---------------")
        const res1=await this.tronWeb.trx.getCurrentBlock()
        const res2=await this.trongridTronweb.trx.getCurrentBlock()
        console.log(res1.block_header.raw_data.number)
        console.log(res2.block_header.raw_data.number)
        console.log("-------- final different -----------")
        console.log(res2.block_header.raw_data.number-res1.block_header.raw_data.number)
      }

      async approvalTrongrid(approvalDto:ApproveDto):Promise<string>{
        try {
          this.trongridTronweb.setPrivateKey(approvalDto.user_private_key);
          let contract = await this.trongridTronweb.contract().at(approvalDto.contract_address);
    
          let result  = await contract.approve(  approvalDto.system_address, Configs.tron.approveMaxUnit).send({  feeLimit: 10000000 })
          return result
        } catch (e) {
          console.log("------------ aproval error --------")
          console.log(e)
        }
      }
}