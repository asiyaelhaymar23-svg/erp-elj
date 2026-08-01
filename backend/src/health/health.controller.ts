import { Controller, Get } from '@nestjs/common';

// Endpoint public, sans dépendance externe : sert de sonde Docker
// (HEALTHCHECK) pour savoir si le processus Node répond, indépendamment de
// l'état de la base de données.
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
