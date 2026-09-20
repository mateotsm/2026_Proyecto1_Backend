import { Test, TestingModule } from '@nestjs/testing';
import { SuperLineaController } from './super-linea.controller';

describe('SuperLineaController', () => {
  let controller: SuperLineaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SuperLineaController],
    }).compile();

    controller = module.get<SuperLineaController>(SuperLineaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
