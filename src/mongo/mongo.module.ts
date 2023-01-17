import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QueueEnum } from 'src/empty-wallet/enums/queue.enum';
import { PostgresModule } from 'src/postgres/postgres.module';
import { ApprovalChargeRepository } from './repositories/approval.charge.repository';
import { TempApprovalRepository } from './repositories/temp.approval.repository';
import { TempTransferRepository } from './repositories/temp.transfer.repository';
import { Trc20EmptyWalletRepository } from './repositories/trc20.empty.wallet.repository';
import { UserWalletRepository } from './repositories/user.wallet.repository';
import { ApprovalChargeSchema, approvalChargeSchema } from './schema/approval.charge.schema';
import { mainApprovalSchema, MainApprovalSchema } from './schema/approval.main.schema';
import { tempApprovalSchema, TempApprovalSchema } from './schema/temp.approval.schema';
import { tempTransferSchema, TempTransferSchema } from './schema/temp.transfer.schema';
import { trc20EmptyWalletSchema, Trc20EmptyWalletSchema } from './schema/trc20.empty.wallet.schema';
import { userWalletSchema, UserWalletSchema } from './schema/user.wallets.schema';

@Module({
    imports:[PostgresModule
        ,MongooseModule.forFeature([{name:UserWalletSchema.name,schema:userWalletSchema},{name:Trc20EmptyWalletSchema.name,schema:trc20EmptyWalletSchema},
            {name:TempApprovalSchema.name,schema:tempApprovalSchema},{name:TempTransferSchema.name,schema:tempTransferSchema},{name:ApprovalChargeSchema.name,schema:approvalChargeSchema},
        {name:MainApprovalSchema.name,schema:mainApprovalSchema}])],
    providers:[UserWalletRepository,Trc20EmptyWalletRepository,TempApprovalRepository,TempTransferRepository,ApprovalChargeRepository],
    exports:[UserWalletRepository,Trc20EmptyWalletRepository,TempApprovalRepository,TempTransferRepository,ApprovalChargeRepository]
})
export class MongoModule {}
