import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateProductoDto } from './create-producto.dto';


describe('CreateProductoDto — CR-001 Validaciones', () => {
  const dtoValido = {
    denominacion: 'Producto Test',
    costo: 100,
    precio: 120,
    porcentaje: 20,
    stock: 10,
    stockMinimo: 2,
    marcaId: 1,
    lineaId: 1,
    utilizaPack: false,
    utilizaStockMinimo: false,
    usuarioCreatedId: 1,
    alicuotaIva: 0,
  };
  
  it('debe ser válido con datos correctos', async () => {
    const dto = plainToClass(CreateProductoDto, dtoValido);
    const errores = await validate(dto);
    console.log('ERRORES:', JSON.stringify(errores.map(e => ({ property: e.property, constraints: e.constraints })), null, 2));
    expect(errores.length).toBe(0);
  });

  it('CR-001: debe rechazar costo = 0', async () => {
    const dto = plainToClass(CreateProductoDto, { ...dtoValido, costo: 0 });
    const errores = await validate(dto);
    const errorCosto = errores.find(e => e.property === 'costo');
    expect(errorCosto).toBeDefined();
    expect(Object.values(errorCosto!.constraints!)).toContain('El costo debe ser mayor a 0.');
  });

  it('CR-001: debe rechazar costo negativo', async () => {
    const dto = plainToClass(CreateProductoDto, { ...dtoValido, costo: -50 });
    const errores = await validate(dto);
    const errorCosto = errores.find(e => e.property === 'costo');
    expect(errorCosto).toBeDefined();
  });

  it('CR-001: debe rechazar porcentaje mayor a 100', async () => {
    const dto = plainToClass(CreateProductoDto, { ...dtoValido, porcentaje: 150 });
    const errores = await validate(dto);
    const errorPorcentaje = errores.find(e => e.property === 'porcentaje');
    expect(errorPorcentaje).toBeDefined();
    expect(Object.values(errorPorcentaje!.constraints!)).toContain('El margen no puede superar el 100%.');
  });

  it('CR-001: debe rechazar porcentaje negativo', async () => {
    const dto = plainToClass(CreateProductoDto, { ...dtoValido, porcentaje: -10 });
    const errores = await validate(dto);
    const errorPorcentaje = errores.find(e => e.property === 'porcentaje');
    expect(errorPorcentaje).toBeDefined();
  });

  it('CR-001: debe rechazar precio = 0', async () => {
    const dto = plainToClass(CreateProductoDto, { ...dtoValido, precio: 0 });
    const errores = await validate(dto);
    const errorPrecio = errores.find(e => e.property === 'precio');
    expect(errorPrecio).toBeDefined();
  });

  it('CR-001: debe rechazar stock negativo', async () => {
    const dto = plainToClass(CreateProductoDto, { ...dtoValido, stock: -5 });
    const errores = await validate(dto);
    const errorStock = errores.find(e => e.property === 'stock');
    expect(errorStock).toBeDefined();
  });

  it('CR-001: debe rechazar stockMinimo negativo', async () => {
    const dto = plainToClass(CreateProductoDto, { ...dtoValido, stockMinimo: -1 });
    const errores = await validate(dto);
    const errorStockMin = errores.find(e => e.property === 'stockMinimo');
    expect(errorStockMin).toBeDefined();
  });

  it('CR-001: debe aceptar porcentaje = 0', async () => {
    const dto = plainToClass(CreateProductoDto, { ...dtoValido, porcentaje: 0 });
    const errores = await validate(dto);
    const errorPorcentaje = errores.find(e => e.property === 'porcentaje');
    expect(errorPorcentaje).toBeUndefined();
  });

  it('CR-001: debe aceptar porcentaje = 100', async () => {
    const dto = plainToClass(CreateProductoDto, { ...dtoValido, porcentaje: 100 });
    const errores = await validate(dto);
    const errorPorcentaje = errores.find(e => e.property === 'porcentaje');
    expect(errorPorcentaje).toBeUndefined();
  });
});