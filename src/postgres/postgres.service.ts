import { UserWalletDetailDto } from './../mongo/dto/user.wallet.detail';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Configs } from 'src/configs';
const { Pool, Client } = require('pg')

@Injectable()
export class PostgresService implements OnModuleInit {
    async onModuleInit() {
        // await this.updateUserApproveStatus("TAZg72mi8zgCbDnVzRGacvxTXxdn5vMhG4","TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t")
        // await this.getSmartAndApproveForAddress()
        }

        pool = new Pool(Configs.postgres)
        

    async insertUserAndWallets(){
           try {
          const response=await this.pool.query(`select * from exchange_main.blockchain.security_crypto sc 
          inner join exchange_main.blockchain.crypto c on c.id = sc."cryptoBaseId" 
          inner join exchange_main.auth."user" u on u.id=sc."userId" 
          where c.symbol_crypto ='TRX' and sc.private_key is not null `)
          return response.rows
           } catch (e) {
            
           }
    }

    async getUserWalletCurrencies(address:string){
        try {
            const resposne=await this.pool.query(`select sc2.id_smart_contract , wc.approve   from exchange_main.blockchain.wallet_crypto wc 
        inner join exchange_main.blockchain.security_crypto sc on sc.id=wc."securityCryptoId" 
        inner join exchange_main.blockchain.smart_contract sc2 on sc2.id = wc."smartContractId" 
        inner join exchange_main.blockchain.arch a on a.id = sc2."archId" 
        where a.symbol_arch ='TRC20' and sc.address ='${address}'`)
        return resposne.rows
        } catch (e) {
            
        }
    }

    async getUserPrivateKey(address:string){
        try {
            const response=await this.pool.query(`select * from exchange_main.blockchain.security_crypto sc 
        where sc.address ='${address}'`)

        return response.rows
        } catch (e) {
            
        }
    }

    async updateUserApproveStatus(address:string,contract:string){
        try {
            const walletCryptoId=await this.pool.query(`select wc.id  from exchange_main.blockchain.security_crypto sc 
        inner join exchange_main.blockchain.wallet_crypto wc on wc."securityCryptoId" = sc.id 
        inner join exchange_main.blockchain.smart_contract sc2 on wc."smartContractId" = sc2.id 
        where sc.address ='${address}' and sc2.id_smart_contract ='${contract}'`)

        const userWalletCryptoId=walletCryptoId.rows[walletCryptoId.rowCount-1].id
        await this.pool.query(`update exchange_main.blockchain.wallet_crypto 
        set approve =true 
        where id='${userWalletCryptoId}'`)
        } catch (e) {
            
        }
    }

    async getSmartAndApproveForAddress(address:string):Promise<UserWalletDetailDto[]>{
        try {
            const smartAndApprove=await this.pool.query(`select sc2.id_smart_contract , wc.approve  from  exchange_main.blockchain.security_crypto sc 
            inner join exchange_main.blockchain.wallet_crypto wc on wc."securityCryptoId" = sc.id 
            inner join exchange_main.blockchain.smart_contract sc2 on sc2.id= wc."smartContractId" 
            where sc.address ='${address}' and sc2.id_smart_contract is not null`)
            const response=smartAndApprove.rows
            let finalWalletDetail:UserWalletDetailDto[]=[]
            for (const smartAndApprove of response) {
                const detailWallet:UserWalletDetailDto={
                    approve:smartAndApprove.approve,
                    id_smart_contract:smartAndApprove.id_smart_contract
                }
                finalWalletDetail.push(detailWallet)
            }

            return finalWalletDetail
        } catch (e) {
            
        }
    }
 
 
}
