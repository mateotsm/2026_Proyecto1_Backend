import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { ActualizacionMasivaPrecioService } from './actualizacion-masiva-precio.service';
import { Producto } from '../../domain/entities/producto.entity';
import { HistorialPrecioService } from '../../../historial-precio/historial-precio.service';
import { TipoAjuste, AlcanceAjuste } from '../../dto/actualizacion-masiva-precio.dto';

const mockProductos = [
  { id: 1, denominacion: 'Producto A', precio: 100, lineaId: 1 },
  { id: 2, denominacion: 'Producto B', precio: 200, lineaId: 1 },
];

const mockQueryBuilder = {
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  getMany: jest.fn().mockResolvedValue(mockProductos),
};

const mockRepository = {
  createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  save: jest.fn().mockResolvedValue({}),
};

const mockHistorialService = {
  registrar: jest.fn().mockResolvedValue({}),
};

describe('ActualizacionMasivaPrecioService — CR-006', () => {
  let service: ActualizacionMasivaPrecioService;

  beforeEach(async () => {
    // ✅ RESET de mocks ANTES de crear el módulo
    jest.clearAllMocks();
    mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.getMany.mockResolvedValue(mockProductos);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActualizacionMasivaPrecioService,
        {
          provide: getRepositoryToken(Producto),
          useValue: mockRepository,
        },
        {
          provide: HistorialPrecioService,
          useValue: mockHistorialService,
        },
      ],
    }).compile();

    service = module.get<ActualizacionMasivaPrecioService>(
      ActualizacionMasivaPrecioService,
    );
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  it('CR-006: debe lanzar error si no hay productos', async () => {
    mockQueryBuilder.getMany.mockResolvedValue([]);
    
    await expect(
      service.actualizarPrecios({
        tipo: TipoAjuste.PORCENTAJE,
        valor: 10,
        alcance: AlcanceAjuste.GLOBAL,
        motivo: 'Test',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('CR-006: debe lanzar error si alcance es linea pero no se provee lineaId', async () => {
    await expect(
      service.actualizarPrecios({
        tipo: TipoAjuste.PORCENTAJE,
        valor: 10,
        alcance: AlcanceAjuste.LINEA,
        motivo: 'Test',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('CR-006: debe aplicar ajuste por porcentaje correctamente', async () => {
    mockQueryBuilder.getMany.mockResolvedValue([
      { id: 1, denominacion: 'Producto A', precio: 100, lineaId: 1 },
    ]);
    
    const resultado = await service.actualizarPrecios({
      tipo: TipoAjuste.PORCENTAJE,
      valor: 10,
      alcance: AlcanceAjuste.GLOBAL,
      motivo: 'Aumento 10%',
    });
    
    expect(resultado.actualizados).toBe(1);
    expect(mockRepository.save).toHaveBeenCalled();
  });

  it('CR-006: debe aplicar ajuste por monto correctamente', async () => {
    mockQueryBuilder.getMany.mockResolvedValue([
      { id: 1, denominacion: 'Producto A', precio: 100, lineaId: 1 },
    ]);
    
    const resultado = await service.actualizarPrecios({
      tipo: TipoAjuste.MONTO,
      valor: 50,
      alcance: AlcanceAjuste.GLOBAL,
      motivo: 'Aumento $50',
    });
    
    expect(resultado.actualizados).toBe(1);
  });

  it('CR-006: debe registrar historial por cada producto actualizado', async () => {
    mockQueryBuilder.getMany.mockResolvedValue([
      { id: 1, denominacion: 'Producto A', precio: 100, lineaId: 1 },
      { id: 2, denominacion: 'Producto B', precio: 200, lineaId: 1 },
    ]);
    
    await service.actualizarPrecios({
      tipo: TipoAjuste.PORCENTAJE,
      valor: 10,
      alcance: AlcanceAjuste.GLOBAL,
      motivo: 'Test historial',
    });
    
    expect(mockHistorialService.registrar).toHaveBeenCalledTimes(2);
  });

  it('CR-006: debe agregar error si precio resultante es <= 0', async () => {
    mockQueryBuilder.getMany.mockResolvedValue([
      { id: 1, denominacion: 'Producto A', precio: 10, lineaId: 1 },
    ]);
    
    const resultado = await service.actualizarPrecios({
      tipo: TipoAjuste.MONTO,
      valor: -100,
      alcance: AlcanceAjuste.GLOBAL,
      motivo: 'Descuento excesivo',
    });
    
    expect(resultado.errores.length).toBeGreaterThan(0);
  });
});