import { Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtPayload } from '../auth/jwt-auth.guard';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favorites: FavoritesService) {}

  @Get('me')
  listMine(@CurrentUser() user: JwtPayload) {
    return this.favorites.listMine(user.sub);
  }

  @Post(':doctorId')
  add(@CurrentUser() user: JwtPayload, @Param('doctorId') doctorId: string) {
    return this.favorites.add(user.sub, doctorId);
  }

  @Delete(':doctorId')
  remove(@CurrentUser() user: JwtPayload, @Param('doctorId') doctorId: string) {
    return this.favorites.remove(user.sub, doctorId);
  }
}
