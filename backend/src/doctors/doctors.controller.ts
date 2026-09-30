import { Controller, Get, Param, Query } from '@nestjs/common';
import { DoctorsService } from './doctors.service';

@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctors: DoctorsService) {}

  @Get()
  findAll(@Query('specialty') specialty?: string, @Query('city') city?: string, @Query('q') q?: string) {
    return this.doctors.findAll({ specialty, city, q });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.doctors.findOne(id);
  }

  @Get(':id/availability')
  availability(@Param('id') id: string, @Query('date') date: string) {
    return this.doctors.availability(id, date);
  }
}
