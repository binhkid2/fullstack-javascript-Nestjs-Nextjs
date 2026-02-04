import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DataSource } from 'typeorm';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly dataSource: DataSource) {}

  @Get()
  async health() {
    const isDbHealthy = this.dataSource.isInitialized;
    return {
      status: 'ok',
      db: isDbHealthy ? 'up' : 'down',
      time: new Date().toISOString(),
    };
  }
}
