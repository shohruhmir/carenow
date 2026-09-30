import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateContentDto } from './dto/update-content.dto';

@Injectable()
export class ContentService {
  constructor(private readonly prisma: PrismaService) {}

  async getPublicMap() {
    const rows = await this.prisma.siteContent.findMany({
      select: { key: true, uz: true, ru: true, en: true },
    });
    return Object.fromEntries(rows.map((r) => [r.key, { uz: r.uz, ru: r.ru, en: r.en }]));
  }

  async listAll() {
    return this.prisma.siteContent.findMany({ orderBy: { key: 'asc' } });
  }

  async update(id: string, dto: UpdateContentDto) {
    const row = await this.prisma.siteContent.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Content not found');

    return this.prisma.siteContent.update({ where: { id }, data: dto });
  }
}
