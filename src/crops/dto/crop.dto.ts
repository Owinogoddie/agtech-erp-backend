import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';
import { CropType } from '@prisma/client';

export class CreateCropDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ enum: CropType })
  @IsEnum(CropType)
  type: CropType;

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiProperty({ default: 'kg' })
  @IsOptional()
  @IsString()
  unit?: string = 'kg';

  @ApiProperty()
  @IsString()
  farmerId: string;
}

export class UpdateCropDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ enum: CropType, required: false })
  @IsOptional()
  @IsEnum(CropType)
  type?: CropType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  unit?: string;
}
