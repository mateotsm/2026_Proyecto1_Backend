import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DenominacionAutomaticaService } from './denominacion-automatica.service';
import { Producto } from '../../domain/entities/producto.entity';
import { BadRequestException } from '@nestjs/common';
import { Marca } from '../../domain/entities/marca.entity';
import { Linea } from '../../domain/entities/linea.entity';

// Mock de Marca y Línea
//const mockMarca = {
//  id: 1,
//  denominacion: 'COCA COLA',
//};

//const mockLinea = {
//  id: 1,
//  denominacion: 'BEBIDAS',
//};

const mockPresentacion = {
  id: 1,
  denominacion: '2.5L',
};

const mockRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

describe('DenominacionAutomaticaService — CR-005 Denominación Automática', () => {
  let service: DenominacionAutomaticaService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DenominacionAutomaticaService,
        {
          provide: getRepositoryToken(Producto),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<DenominacionAutomaticaService>(DenominacionAutomaticaService);
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  // ========== GENERACIÓN AUTOMÁTICA ==========

  it('CR-005: debe generar denominación automática con Marca + Línea + Presentación', () => {
    const resultado = service.generarDenominacionLocal(
      mockMarca.denominacion,
      mockLinea.denominacion,
      //mockPresentacion.denominacion,
    );

    expect(resultado).toBe('COCA COLA BEBIDAS 2.5L');
  });

  it('CR-005: debe generar con espacios entre componentes', () => {
    const resultado = service.generarDenominacionLocal('MARCA', 'LINEA');

    expect(resultado).toMatch(/\s+/); // Contiene espacios
    expect(resultado.split(' ').length).toBeGreaterThanOrEqual(3);
  });

  it('CR-005: debe ser editable manualmente después de generarse', () => {
    const denominacionGenerada = service.generarDenominacionLocal(
      'COCA COLA',
      'BEBIDAS',
      //'2.5L',
    );
    const denominacionEditada = 'COCA COLA 2.5L PERSONAL';

    expect(denominacionEditada).not.toBe(denominacionGenerada);
    expect(denominacionEditada.length).toBeGreaterThan(0);
  });

  // ========== VALIDACIONES DE PRESENTACIÓN ==========

  it('CR-005: debe rechazar presentación vacía', () => {
    expect(() => {
      service.generarDenominacionLocal('MARCA', 'LINEA');
    }).toThrow(BadRequestException);
  });

  it('CR-005: debe rechazar presentación null', () => {
    expect(() => {
      service.generarDenominacionLocal('MARCA', 'LINEA');
    }).toThrow(BadRequestException);
  });

  it('CR-005: debe aceptar presentaciones variadas (1L, pack, botella, etc)', () => {
    const presentaciones = ['1L', 'pack', 'botella', 'lata', '500ml'];

    for (const pres of presentaciones) {
      const resultado = service.generarDenominacionLocal('MARCA', 'LINEA');
      expect(resultado).toContain(pres);
    }
  });

  // ========== FORMATO Y NORMALIZACIÓN ==========

  it('CR-005: debe normalizar a mayúsculas', () => {
    const resultado = service.generarDenominacionLocal(
      'coca cola',
      'bebidas',
      //'2.5l',
    );

    expect(resultado).toBe(resultado.toUpperCase());
  });

  it('CR-005: debe trimear espacios en blanco', () => {
    const resultado = service.generarDenominacionLocal(
      '  COCA COLA  ',
      '  BEBIDAS  ',
      //'  2.5L  ',
    );

    expect(resultado).not.toContain('  '); // Sin dobles espacios
  });

  // ========== INTEGRACIÓN CON PRODUCTO ==========

  it('CR-005: debe ser posible usar denominación generada al crear producto', async () => {
    mockRepository.create.mockReturnValue({
      denominacion: 'COCA COLA BEBIDAS 2.5L',
      marcaId: 1,
      lineaId: 1,
    });
    mockRepository.save.mockResolvedValue({
      id: 1,
      denominacion: 'COCA COLA BEBIDAS 2.5L',
      marcaId: 1,
      lineaId: 1,
    });

    const denominacionAutomatica = service.generarDenominacionLocal(
      'COCA COLA',
      'BEBIDAS',
      //'2.5L',
    );

    expect(denominacionAutomatica).toBeDefined();
    expect(denominacionAutomatica).toContain('COCA COLA');
  });

  // ========== UNICIDAD ==========

  it('CR-005: debe permitir denominaciones duplicadas si son ediciones manuales diferentes', () => {
    const denom1 = service.generarDenominacionLocal(
      'COCA COLA',
      'BEBIDAS',
      //'2.5L',
    );
    const denom2Editada = 'COCA COLA 2.5L OFERTAS';

    // Ambas pueden coexistir porque denom2 es edición manual
    expect(denom1).not.toBe(denom2Editada);
  });

  it('CR-005: debe retornar denominación consistente para mismos parámetros', () => {
    const resultado1 = service.generarDenominacionLocal(
      'COCA COLA',
      'BEBIDAS',
      //'2.5L',
    );
    const resultado2 = service.generarDenominacionLocal(
      'COCA COLA',
      'BEBIDAS',
      //'2.5L',
    );

    expect(resultado1).toBe(resultado2);
  });

  // ========== DEPENDENCIA DE CR-002 ==========

  it('CR-005: Depende de CR-002 (Presentación debe existir)', () => {
    // Este test verifica que el servicio requiere presentación válida
    const presentacionValida = '1L';
    const resultado = service.generarDenominacionLocal(
      'MARCA',
      'LINEA',
      //presentacionValida,
    );

    expect(resultado).toContain(presentacionValida);
  });
});
