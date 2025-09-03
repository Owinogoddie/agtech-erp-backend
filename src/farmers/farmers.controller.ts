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
import { FarmersService } from './farmers.service';
import { CreateFarmerDto, UpdateFarmerDto } from './dto/farmer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Farmers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('farmers')
export class FarmersController {
  constructor(private readonly farmersService: FarmersService) {}

  @ApiOperation({ summary: 'Create new farmer (Admin only)' })
  @Roles(Role.ADMIN)
  @Post()
  create(@Body() createFarmerDto: CreateFarmerDto) {
    return this.farmersService.create(createFarmerDto);
  }

  @ApiOperation({ summary: 'Get all farmers (Admin only)' })
  @Roles(Role.ADMIN)
  @Get()
  findAll() {
    return this.farmersService.findAll();
  }

  @ApiOperation({ summary: 'Get farmer statistics (Admin only)' })
  @Roles(Role.ADMIN)
  @Get('stats')
  getStats() {
    return this.farmersService.getStats();
  }

  @ApiOperation({ summary: 'Get farmer by ID' })
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.farmersService.findOne(id, req.user.id, req.user.role);
  }

  @ApiOperation({ summary: 'Update farmer' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFarmerDto: UpdateFarmerDto,
    @Request() req,
  ) {
    return this.farmersService.update(
      id,
      updateFarmerDto,
      req.user.id,
      req.user.role,
    );
  }

  @ApiOperation({ summary: 'Delete farmer (Admin only)' })
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.farmersService.remove(id);
  }
}
