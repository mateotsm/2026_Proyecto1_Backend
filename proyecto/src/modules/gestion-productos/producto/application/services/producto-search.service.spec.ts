import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductoSearchService } from './producto-search.service';
import { Producto } from '../../domain/entities/producto.entity';

const mockProductos = [
  { 
    id: 1, 
    denominacion: 'Coca Cola 2.5L', 
    linea: { id: 1, denominacion: 'BEBIDAS' },
  },
  { 
    id: 2, 
    denominacion: 'Fanta Naranja 1L', 
    linea: { id: 1, denominacion: 'BEBIDAS' },
  },
  { 
    id: 3, 
    denominacion: 'Cerveza Quilmes 500ml', 
    linea: { id: 2, denominacion: 'CERVEZAS' },
  },
  { 
    id: 4, 
    denominacion: 'Pan Bimbo', 
    linea: { id: 3, denominacion: 'ALMACÉN' },
  },
];

const mockQueryBuilder = {
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  getMany: jest.fn().mockResolvedValue(mockProductos),
  getManyAndCount: jest.fn().mockResolvedValue([mockProductos, mockProductos.length]),
};

const mockRepository = {
  createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
};

describe('ProductoSearchService — CR-004 Búsqueda', () => {
  let service: ProductoSearchService;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductoSearchService,
        {
          provide: getRepositoryToken(Producto),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ProductoSearchService>(ProductoSearchService);
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  // ========== BÚSQUEDA POR DENOMINACIÓN ==========

  it('CR-004: debe buscar por denominación exacta', async () => {
    mockQueryBuilder.getMany.mockResolvedValue([mockProductos[0]]);
    
    const resultado = await service.buscarPorDenominacion('Coca Cola 2.5L');
    
    expect(mockQueryBuilder.where).toHaveBeenCalled();
    expect(resultado).toHaveLength(1);
    expect(resultado[0].denominacion).toBe('Coca Cola 2.5L');
  });

  it('CR-004: debe buscar por denominación con coincidencias parciales (LIKE)', async () => {
    mockQueryBuilder.getMany.mockResolvedValue([mockProductos[0], mockProductos[1]]);
    
    const resultado = await service.buscarPorDenominacion('Coca');
    
    expect(resultado.length).toBeGreaterThan(0);
  });

  it('CR-004: debe ser case-insensitive en búsqueda de denominación', async () => {
    mockQueryBuilder.getMany.mockResolvedValue([mockProductos[0]]);
    
    const resultado = await service.buscarPorDenominacion('coca cola');
    
    expect(resultado.length).toBeGreaterThan(0);
  });

  it('CR-004: debe retornar vacío si no hay coincidencias en denominación', async () => {
    mockQueryBuilder.getMany.mockResolvedValue([]);
    
    const resultado = await service.buscarPorDenominacion('Producto Inexistente');
    
    expect(resultado).toHaveLength(0);
  });

  // ========== BÚSQUEDA POR LÍNEA ==========

  it('CR-004: debe buscar por ID de Línea', async () => {
    const productosLinea1 = mockProductos.filter(p => p.linea.id === 1);
    mockQueryBuilder.getManyAndCount.mockResolvedValue([productosLinea1, productosLinea1.length]);
    
    const resultado = await service.buscarPorLinea(1, 0, 10);
    
    expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
    expect(resultado.data.every(p => p.linea.id === 1)).toBe(true);
  });

  it('CR-004: debe buscar por denominación de Línea', async () => {
    const productosLinea1 = mockProductos.filter(p => p.linea.denominacion === 'BEBIDAS');
    mockQueryBuilder.getManyAndCount.mockResolvedValue([productosLinea1, productosLinea1.length]);
    
    const resultado = await service.buscarPorLineaDenominacion('BEBIDAS', 0, 10);
    
    expect(resultado.data.every(p => p.linea.denominacion === 'BEBIDAS')).toBe(true);
  });

  it('CR-004: debe retornar paginated results para búsqueda por Línea', async () => {
    mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockProductos[0]], 1]);
    
    const resultado = await service.buscarPorLinea(1, 0, 1);
    
    expect(resultado.data).toHaveLength(1);
    expect(resultado.total).toBe(1);
  });

  it('CR-004: debe aplicar paginación correctamente', async () => {
    mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockProductos[0]], 4]);
    
    const resultado = await service.buscarPorLinea(1, 1, 1);
    
    expect(resultado.page).toBe(1);
    expect(resultado.limit).toBe(1);
  });

  it('CR-004: debe manejar búsqueda vacía sin errores', async () => {
    mockQueryBuilder.getManyAndCount.mockResolvedValue([mockProductos, mockProductos.length]);
  });
    
})