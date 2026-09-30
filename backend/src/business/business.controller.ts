import { Body, Controller, Post } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';

// Public, unauthenticated — matches frontend/pages/business/index.vue's
// current form ({ name, city, branches, phone }), which is a lead-capture
// form, not a real clinic dashboard (that dashboard doesn't exist on the
// frontend yet — see backend epic issue #2's "Business dashboard scope" note).
@Controller('business')
export class BusinessController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('leads')
  create(@Body() dto: CreateLeadDto) {
    return this.prisma.businessLead.create({
      data: { clinicName: dto.clinicName, city: dto.city, branchCount: dto.branchCount, phone: dto.phone },
    });
  }
}
