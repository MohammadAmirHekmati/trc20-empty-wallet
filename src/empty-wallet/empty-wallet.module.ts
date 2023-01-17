import { TronModule } from './../tron/tron.module';
import { MongoModule } from './../mongo/mongo.module';
import { Module } from '@nestjs/common';
import { EmptyWalletService } from './empty-wallet.service';
import { PostgresModule } from 'src/postgres/postgres.module';
import { BullModule } from '@nestjs/bull';
import { QueueEnum } from './enums/queue.enum';

@Module({
  imports:[MongoModule,TronModule,PostgresModule,BullModule.registerQueue({name:QueueEnum.QUEUE_BOT_TRON_TRC20})],
  providers: [EmptyWalletService]
})
export class EmptyWalletModule {}
