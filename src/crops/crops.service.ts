import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateCropDto, UpdateCropDto } from './dto/crop.dto';
import { Role } from '@prisma/client';

@Injectable()
export class CropsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createCropDto: CreateCropDto,
    userId: string,
    userRole: Role,
    farmerId?: string,
  ) {
    // If user is farmer, they can only create crops for themselves
    if (userRole === Role.FARMER && farmerId) {
      createCropDto.farmerId = farmerId;
    }

    return this.prisma.crop.create({
      data: createCropDto,
      include: {
        farmer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async findAll(userId: string, userRole: Role, farmerId?: string) {
    if (userRole === Role.ADMIN) {
      return this.prisma.crop.findMany({
        include: {
          farmer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });
    }

    // Farmers can only see their own crops
    return this.prisma.crop.findMany({
      where: {
        farmerId: farmerId,
      },
      include: {
        farmer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async findOne(id: string, userId: string, userRole: Role, farmerId?: string) {
    const crop = await this.prisma.crop.findUnique({
      where: { id },
      include: {
        farmer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!crop) {
      throw new NotFoundException('Crop not found');
    }

    // If not admin, ensure farmer can only access their own crops
    if (userRole !== Role.ADMIN && crop.farmerId !== farmerId) {
      throw new ForbiddenException('Access denied');
    }

    return crop;
  }

  async update(
    id: string,
    updateCropDto: UpdateCropDto,
    userId: string,
    userRole: Role,
    farmerId?: string,
  ) {
    await this.findOne(id, userId, userRole, farmerId);

    return this.prisma.crop.update({
      where: { id },
      data: updateCropDto,
      include: {
        farmer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId: string, userRole: Role, farmerId?: string) {
    await this.findOne(id, userId, userRole, farmerId);

    return this.prisma.crop.delete({
      where: { id },
    });
  }

  async getCropStats(userId: string, userRole: Role, farmerId?: string) {
    const whereClause = userRole === Role.FARMER ? { farmerId } : {};

    const totalCrops = await this.prisma.crop.count({
      where: whereClause,
    });

    const cropsByType = await this.prisma.crop.groupBy({
      by: ['type'],
      where: whereClause,
      _count: {
        id: true,
      },
    });

    return {
      totalCrops,
      cropsByType: cropsByType.map((item) => ({
        type: item.type,
        count: item._count.id,
      })),
    };
  }
}
