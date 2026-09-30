import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async listMine(userId: string) {
    return this.prisma.favorite.findMany({
      where: { userId },
      include: {
        doctor: {
          include: { clinic: { select: { id: true, slug: true, name: true } }, branch: { select: { id: true, name: true, address: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async add(userId: string, doctorId: string) {
    const doctor = await this.prisma.doctor.findUnique({ where: { id: doctorId } });
    if (!doctor) throw new NotFoundException('Doctor not found');

    return this.prisma.favorite.upsert({
      where: { userId_doctorId: { userId, doctorId } },
      update: {},
      create: { userId, doctorId },
    });
  }

  async remove(userId: string, doctorId: string) {
    await this.prisma.favorite.deleteMany({ where: { userId, doctorId } });
    return { removed: true };
  }
}
