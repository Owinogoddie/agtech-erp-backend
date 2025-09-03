import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from 'prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
// import { AuthModule } from './auth/auth.module';
// import { FarmersModule } from './farmers/farmers.module';
// import { CropsModule } from './crops/crops.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    // FarmersModule,
    // CropsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
