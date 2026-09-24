import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SuperLineaService } from './super-linea.service';
import { SuperLinea } from '../linea/domain/entities/super-linea.entity';

const mockSuperLinea = {
  id: 1,
  denominacion: 'BEBIDAS',
  observacion: null,
  lineas: [],
  deletedAt: null,
};

const mockRepository = {
  findOne: jest.fn(),
  findAndCount: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  softDelete: jest.fn(),
};

describe('SuperLineaService — CR-003', () => {
  let service: SuperLineaService;
  let repository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuperLineaService,
        {
          provide: getRepositoryToken(SuperLinea),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<SuperLineaService>(SuperLineaService);
    repository = module.get(getRepositoryToken(SuperLinea));
    
    // ✅ IMPORTANTE: limpiar mocks antes de cada test
    jest.clearAllMocks();
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  it('CR-003: findOne debe lanzar NotFoundException si no existe', async () => {
    mockRepository.findOne.mockResolvedValue(null);
    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
  });

  it('CR-003: remove debe lanzar BadRequestException si tiene Líneas asociadas', async () => {
    mockRepository.findOne.mockResolvedValue({
      ...mockSuperLinea,
      lineas: [{ id: 1, denominacion: 'GASEOSAS' }],
    });
    await expect(service.remove(1)).rejects.toThrow(BadRequestException);
  });

  it('CR-003: remove debe eliminar si no tiene Líneas asociadas', async () => {
    mockRepository.findOne.mockResolvedValue({ ...mockSuperLinea, lineas: [] });
    mockRepository.softDelete.mockResolvedValue({ affected: 1 });
    
    await service.remove(1);
    
    expect(mockRepository.softDelete).toHaveBeenCalledWith(1);
  });

  it('CR-003: create debe lanzar BadRequestException si ya existe la denominación', async () => {
    mockRepository.findOne.mockResolvedValue(mockSuperLinea);
    
    await expect(
      service.create({ denominacion: 'BEBIDAS' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('CR-003: create debe guardar con denominación en mayúsculas', async () => {
    mockRepository.findOne.mockResolvedValue(null);
    mockRepository.create.mockReturnValue({ denominacion: 'BEBIDAS' });
    mockRepository.save.mockResolvedValue({ id: 1, denominacion: 'BEBIDAS' });
    
    const resultado = await service.create({ denominacion: 'bebidas' });
    
    expect(mockRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ denominacion: 'BEBIDAS' }),
    );
    expect(resultado.denominacion).toBe('BEBIDAS');
  });
});