import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClinicsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: { is247?: boolean; q?: string }) {
    const { is247, q } = params;
    return this.prisma.clinic.findMany({
      where: {
        ...(is247 !== undefined ? { is247 } : {}),
        ...(q ? { name: { contains: q, mode: 'insensitive' } } : {}),
      },
      include: {
        branches: true,
        _count: { select: { doctors: true } },
        // Specialty only (not full doctor rows) — lets the frontend derive
        // "has a pediatric specialist" for its map filter honestly, instead
        // of needing a separate hasKids flag that doesn't exist in the schema.
        doctors: { select: { specialty: true } },
      },
      orderBy: { rating: 'desc' },
    });
  }

  async findBySlug(slug: string) {
    const clinic = await this.prisma.clinic.findUnique({
      where: { slug },
      include: { branches: true, doctors: true, services: true },
    });
    if (!clinic) throw new NotFoundException('Clinic not found');
    return clinic;
  }
}
