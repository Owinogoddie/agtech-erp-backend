import { Module } from '@nestjs/common';
import { FarmersService } from './farmers.service';
import { FarmersController } from './farmers.controller';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FarmersController],
  providers: [FarmersService],
  exports: [FarmersService],
})
export class FarmersModule {}
