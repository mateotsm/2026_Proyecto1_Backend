import { Test, TestingModule } from '@nestjs/testing';
import { HistorialPrecioController } from './historial-precio.controller';

describe('HistorialPrecioController', () => {
  let controller: HistorialPrecioController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HistorialPrecioController],
    }).compile();

    controller = module.get<HistorialPrecioController>(HistorialPrecioController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
