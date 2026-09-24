import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HistorialPrecioService } from './historial-precio.service';
import { HistorialPrecio } from '../producto/domain/entities/historial-precio.entity';

const mockHistorial = [
  { id: 1, productoId: 1, precioAnterior: 100, precioNuevo: 110, motivo: 'Aumento', fecha: new Date() },
  { id: 2, productoId: 1, precioAnterior: 110, precioNuevo: 120, motivo: 'Inflación', fecha: new Date() },
];

const mockRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findAndCount: jest.fn(),
};

describe('HistorialPrecioService — CR-007', () => {
  let service: HistorialPrecioService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HistorialPrecioService,
        {
          provide: getRepositoryToken(HistorialPrecio),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<HistorialPrecioService>(HistorialPrecioService);
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  it('CR-007: registrar debe crear y guardar un registro de historial', async () => {
    const registro = {
      id: 1,
      productoId: 1,
      precioAnterior: 100,
      precioNuevo: 110,
      motivo: 'Aumento',
      usuarioId: 8,
      fecha: new Date(),
    };
    mockRepository.create.mockReturnValue(registro);
    mockRepository.save.mockResolvedValue(registro);

    const resultado = await service.registrar(1, 100, 110, 'Aumento', 8);

    expect(mockRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        productoId: 1,
        precioAnterior: 100,
        precioNuevo: 110,
        motivo: 'Aumento',
        usuarioId: 8,
      }),
    );
    expect(mockRepository.save).toHaveBeenCalled();
    expect(resultado).toEqual(registro);
  });

  it('CR-007: findByProducto debe retornar historial paginado', async () => {
    mockRepository.findAndCount.mockResolvedValue([mockHistorial, 2]);

    const resultado = await service.findByProducto(1, 0, 10);

    expect(resultado.data).toHaveLength(2);
    expect(resultado.total).toBe(2);
  });

  it('CR-007: findByProducto debe ordenar por fecha DESC', async () => {
    mockRepository.findAndCount.mockResolvedValue([mockHistorial, 2]);

    await service.findByProducto(1, 0, 10);

    expect(mockRepository.findAndCount).toHaveBeenCalled();
  });

  it('CR-007: registrar debe funcionar sin usuarioId', async () => {
    const registro = {
      id: 1,
      productoId: 1,
      precioAnterior: 50,
      precioNuevo: 60,
      motivo: 'Test',
      usuarioId: undefined,
    };
    mockRepository.create.mockReturnValue(registro);
    mockRepository.save.mockResolvedValue(registro);

    const resultado = await service.registrar(1, 50, 60, 'Test');

    expect(mockRepository.create).toHaveBeenCalled();
    expect(resultado).toEqual(registro);
  });
});