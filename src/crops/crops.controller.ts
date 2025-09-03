/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CropsService } from './crops.service';
import { CreateCropDto, UpdateCropDto } from './dto/crop.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Crops')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('crops')
export class CropsController {
  constructor(private readonly cropsService: CropsService) {}

  @ApiOperation({ summary: 'Create new crop' })
  @Post()
  create(@Body() createCropDto: CreateCropDto, @Request() req) {
    return this.cropsService.create(
      createCropDto,
      req.user.id,
      req.user.role,
      req.user.farmerId,
    );
  }

  @ApiOperation({ summary: 'Get all crops' })
  @Get()
  findAll(@Request() req) {
    return this.cropsService.findAll(
      req.user.id,
      req.user.role,
      req.user.farmerId,
    );
  }

  @ApiOperation({ summary: 'Get crop statistics' })
  @Get('stats')
  getStats(@Request() req) {
    return this.cropsService.getCropStats(
      req.user.id,
      req.user.role,
      req.user.farmerId,
    );
  }

  @ApiOperation({ summary: 'Get crop by ID' })
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.cropsService.findOne(
      id,
      req.user.id,
      req.user.role,
      req.user.farmerId,
    );
  }

  @ApiOperation({ summary: 'Update crop' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCropDto: UpdateCropDto,
    @Request() req,
  ) {
    return this.cropsService.update(
      id,
      updateCropDto,
      req.user.id,
      req.user.role,
      req.user.farmerId,
    );
  }

  @ApiOperation({ summary: 'Delete crop' })
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.cropsService.remove(
      id,
      req.user.id,
      req.user.role,
      req.user.farmerId,
    );
  }
}
