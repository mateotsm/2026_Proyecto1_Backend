import { Test, TestingModule } from '@nestjs/testing';
import { HistorialPrecioService } from './historial-precio.service';

describe('HistorialPrecioService', () => {
  let service: HistorialPrecioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HistorialPrecioService],
    }).compile();

    service = module.get<HistorialPrecioService>(HistorialPrecioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
