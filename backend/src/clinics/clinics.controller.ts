import { Controller, Get, Param, Query } from '@nestjs/common';
import { ClinicsService } from './clinics.service';

@Controller('clinics')
export class ClinicsController {
  constructor(private readonly clinics: ClinicsService) {}

  @Get()
  findAll(@Query('is247') is247?: string, @Query('q') q?: string) {
    return this.clinics.findAll({ is247: is247 === undefined ? undefined : is247 === 'true', q });
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.clinics.findBySlug(slug);
  }
}
