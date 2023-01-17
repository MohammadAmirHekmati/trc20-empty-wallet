import { Configs } from './configs';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoModule } from './mongo/mongo.module';
import { PostgresModule } from './postgres/postgres.module';
import { ScheduleModule } from '@nestjs/schedule';
import { EmptyWalletModule } from './empty-wallet/empty-wallet.module';
import { TronModule } from './tron/tron.module';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [MongoModule, PostgresModule,
  MongooseModule.forRoot(Configs.mongoose.url),
  ScheduleModule.forRoot(),
  BullModule.forRoot({redis:{
    host:Configs.redis.host,
    port:Configs.redis.port
  }}),
  EmptyWalletModule,
  TronModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
