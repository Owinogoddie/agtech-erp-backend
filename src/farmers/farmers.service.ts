import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateFarmerDto, UpdateFarmerDto } from './dto/farmer.dto';
import { Role } from '@prisma/client';

@Injectable()
export class FarmersService {
  constructor(private prisma: PrismaService) {}

  async create(createFarmerDto: CreateFarmerDto) {
    return this.prisma.farmer.create({
      data: createFarmerDto,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        _count: {
          select: {
            crops: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.farmer.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        _count: {
          select: {
            crops: true,
          },
        },
      },
    });
  }

  async findOne(id: string, userId?: string, userRole?: Role) {
    const farmer = await this.prisma.farmer.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        crops: true,
      },
    });

    if (!farmer) {
      throw new NotFoundException('Farmer not found');
    }

    // If not admin, ensure farmer can only access their own data
    if (userRole !== Role.ADMIN && farmer.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return farmer;
  }

  async update(
    id: string,
    updateFarmerDto: UpdateFarmerDto,
    userId?: string,
    userRole?: Role,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const farmer = await this.findOne(id, userId, userRole);

    return this.prisma.farmer.update({
      where: { id },
      data: updateFarmerDto,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    const farmer = await this.prisma.farmer.findUnique({
      where: { id },
    });

    if (!farmer) {
      throw new NotFoundException('Farmer not found');
    }

    return this.prisma.farmer.delete({
      where: { id },
    });
  }

  async getStats() {
    const totalFarmers = await this.prisma.farmer.count();
    const totalCrops = await this.prisma.crop.count();

    const cropsPerFarmer = await this.prisma.farmer.findMany({
      select: {
        firstName: true,
        lastName: true,
        _count: {
          select: {
            crops: true,
          },
        },
      },
    });

    return {
      totalFarmers,
      totalCrops,
      cropsPerFarmer,
    };
  }
}
