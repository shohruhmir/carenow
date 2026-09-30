import { Controller, Get } from '@nestjs/common';
import { ContentService } from './content.service';

// Public, unauthenticated — the frontend fetches this on every app boot to
// resolve site-content keys. No create/delete surface exists anywhere (see
// ContentService) so the exposed set is bounded to whatever's deliberately
// seeded.
@Controller('site-content')
export class ContentController {
  constructor(private readonly content: ContentService) {}

  @Get()
  getPublicMap() {
    return this.content.getPublicMap();
  }
}
