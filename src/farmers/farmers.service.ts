import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateFarmerDto, UpdateFarmerDto } from './dto/farmer.dto';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class FarmersService {
  constructor(private prisma: PrismaService) {}

  async create(createFarmerDto: CreateFarmerDto) {
    // Check if user with email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createFarmerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createFarmerDto.password, 10);

    // Create user with farmer profile
    return this.prisma.user.create({
      data: {
        email: createFarmerDto.email,
        password: hashedPassword,
        role: Role.FARMER,
        farmer: {
          create: {
            firstName: createFarmerDto.firstName,
            lastName: createFarmerDto.lastName,
            phone: createFarmerDto.phone,
            address: createFarmerDto.address,
            dateOfBirth: createFarmerDto.dateOfBirth
              ? new Date(createFarmerDto.dateOfBirth)
              : null,
            nationalId: createFarmerDto.nationalId,
            farmSize: createFarmerDto.farmSize,
            farmLocation: createFarmerDto.farmLocation,
          },
        },
      },
      include: {
        farmer: {
          include: {
            _count: {
              select: {
                crops: true,
              },
            },
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
      data: {
        ...updateFarmerDto,
        dateOfBirth: updateFarmerDto.dateOfBirth
          ? new Date(updateFarmerDto.dateOfBirth)
          : undefined,
      },
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
      include: { user: true },
    });

    if (!farmer) {
      throw new NotFoundException('Farmer not found');
    }

    // Delete the user (farmer will be deleted via cascade)
    return this.prisma.user.delete({
      where: { id: farmer.userId },
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

    const averageFarmSize = await this.prisma.farmer.aggregate({
      _avg: {
        farmSize: true,
      },
    });

    return {
      totalFarmers,
      totalCrops,
      averageFarmSize: averageFarmSize._avg.farmSize || 0,
      cropsPerFarmer,
    };
  }
}
