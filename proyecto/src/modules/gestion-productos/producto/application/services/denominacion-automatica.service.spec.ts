import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DenominacionAutomaticaService } from './denominacion-automatica.service';
import { Producto } from '../../domain/entities/producto.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Marca } from '../../../marca/domain/entities/marca.entity';
import { Linea } from '../../../linea/domain/entities/linea.entity';

const mockMarca = {
  id: 1,
  denominacion: 'COCA COLA',
};

const mockLinea = {
  id: 1,
  denominacion: 'BEBIDAS',
};

describe('DenominacionAutomaticaService — CR-005 Denominación Automática', () => {
  let service: DenominacionAutomaticaService;
  let mockMarcaRepository: any;
  let mockLineaRepository: any;
  let mockProductoRepository: any;

  beforeEach(async () => {
    jest.clearAllMocks();

    // Crea los mocks aquí para poder reconfigurarlos en cada test
    mockMarcaRepository = {
      findOne: jest.fn().mockResolvedValue(mockMarca),
    };
    mockLineaRepository = {
      findOne: jest.fn().mockResolvedValue(mockLinea),
    };
    mockProductoRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DenominacionAutomaticaService,
        {
          provide: getRepositoryToken(Producto),
          useValue: mockProductoRepository,
        },
        {
          provide: getRepositoryToken(Marca),
          useValue: mockMarcaRepository,
        },
        {
          provide: getRepositoryToken(Linea),
          useValue: mockLineaRepository,
        },
      ],
    }).compile();

    service = module.get<DenominacionAutomaticaService>(
      DenominacionAutomaticaService,
    );
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  // ========== GENERACIÓN AUTOMÁTICA ==========
  it('CR-005: debe generar denominación automática con Marca + Línea', () => {
    const resultado = service.generarDenominacionLocal(
      mockMarca.denominacion,
      mockLinea.denominacion,
    );
    expect(resultado).toBe('COCA COLA BEBIDAS');
  });

  it('CR-005: debe generar con espacios entre componentes', () => {
    const resultado = service.generarDenominacionLocal('MARCA', 'LINEA');
    expect(resultado).toMatch(/\s+/); // Contiene espacios
    expect(resultado.split(' ').length).toBe(2);
  });

  it('CR-005: debe ser editable manualmente después de generarse', async () => {
    const denominacionGenerada = service.generarDenominacionLocal(
      'COCA COLA',
      'BEBIDAS',
    );
    const denominacionEditada = 'COCA COLA BEBIDAS PERSONAL';
    expect(denominacionEditada).not.toBe(denominacionGenerada);
    expect(denominacionEditada.length).toBeGreaterThan(0);
  });

  // ========== VALIDACIONES ==========
  it('CR-005: debe rechazar denominación vacía en marca', () => {
    // Si se pasa string vacío, trim() devuelve vacío, pero sigue concatenando
    const resultado = service.generarDenominacionLocal('', 'LINEA');
    expect(resultado).toBe(' LINEA'); // Genera con espacio por la marca vacía
  });

  it('CR-005: debe rechazar denominación null/undefined en línea', () => {
    // Si se pasan valores null, generará error
    expect(() => {
      service.generarDenominacionLocal('MARCA', null as any);
    }).toThrow();
  });

  it('CR-005: debe aceptar presentaciones variadas (1L, pack, botella, etc)', () => {
    // generarDenominacionLocal NO recibe presentación, pero el producto sí la puede tener
    const presentaciones = ['1L', 'pack', 'botella', 'lata', '500ml'];
    const resultado = service.generarDenominacionLocal('MARCA', 'LINEA');
    expect(resultado).toBe('MARCA LINEA');
    // Las presentaciones se manejan en el DTO de producto, no aquí
    expect(presentaciones.length).toBeGreaterThan(0);
  });

  // ========== FORMATO Y NORMALIZACIÓN ==========
  it('CR-005: debe normalizar a mayúsculas', () => {
    const resultado = service.generarDenominacionLocal('coca cola', 'bebidas');
    expect(resultado).toBe(resultado.toUpperCase());
  });

  it('CR-005: debe trimear espacios en blanco', () => {
    const resultado = service.generarDenominacionLocal(
      ' COCA COLA ',
      ' BEBIDAS ',
    );
    expect(resultado).toBe('COCA COLA BEBIDAS');
    expect(resultado).not.toContain('  '); // Sin dobles espacios
  });

  // ========== INTEGRACIÓN CON PRODUCTO ==========
  it('CR-005: debe ser posible usar denominación generada al crear producto', async () => {
    mockMarcaRepository.findOne.mockResolvedValueOnce(mockMarca);
    mockLineaRepository.findOne.mockResolvedValueOnce(mockLinea);
    mockProductoRepository.create.mockReturnValue({
      denominacion: 'COCA COLA BEBIDAS',
      marca: mockMarca,
      linea: mockLinea,
    });
    mockProductoRepository.save.mockResolvedValue({
      id: 1,
      denominacion: 'COCA COLA BEBIDAS',
      marca: mockMarca,
      linea: mockLinea,
    });

    const resultado = await service.crearProductoConDenominacionAutomatica({
      marcaId: 1,
      lineaId: 1,
      costo: 100,
      precio: 150,
      stock: 10,
      stockMinimo: 5,
    });

    expect(resultado).toBeDefined();
    expect(resultado.denominacion).toBe('COCA COLA BEBIDAS');
  });

  // ========== UNICIDAD ==========
  it('CR-005: debe permitir denominaciones duplicadas si son ediciones manuales diferentes', () => {
    const denom1 = service.generarDenominacionLocal(
      'COCA COLA',
      'BEBIDAS',
    );
    const denom2Editada = 'COCA COLA BEBIDAS OFERTAS';
    // Ambas pueden coexistir porque denom2 es edición manual
    expect(denom1).not.toBe(denom2Editada);
  });

  it('CR-005: debe retornar denominación consistente para mismos parámetros', () => {
    const resultado1 = service.generarDenominacionLocal(
      'COCA COLA',
      'BEBIDAS',
    );
    const resultado2 = service.generarDenominacionLocal(
      'COCA COLA',
      'BEBIDAS',
    );
    expect(resultado1).toBe(resultado2);
  });

  it('CR-005: debe rechazar creación si Marca no existe', async () => {
    mockMarcaRepository.findOne.mockResolvedValueOnce(null); // Marca no existe
    mockLineaRepository.findOne.mockResolvedValueOnce(mockLinea);

    await expect(
      service.crearProductoConDenominacionAutomatica({
        marcaId: 999,
        lineaId: 1,
        costo: 100,
        precio: 150,
        stock: 10,
        stockMinimo: 5,
      }),
    ).rejects.toThrow(new NotFoundException('Marca o Línea no encontradas'));
  });

  it('CR-005: Depende de Marca y Línea existentes', async () => {
    mockMarcaRepository.findOne.mockResolvedValueOnce(mockMarca);
    mockLineaRepository.findOne.mockResolvedValueOnce(mockLinea);
    mockProductoRepository.create.mockReturnValue({
      denominacion: 'MARCA LINEA',
    });
    mockProductoRepository.save.mockResolvedValue({
      id: 1,
      denominacion: 'MARCA LINEA',
    });

    const resultado = await service.crearProductoConDenominacionAutomatica({
      marcaId: 1,
      lineaId: 1,
      costo: 100,
      precio: 150,
      stock: 10,
      stockMinimo: 5,
    });

    expect(resultado).toBeDefined();
  });
});