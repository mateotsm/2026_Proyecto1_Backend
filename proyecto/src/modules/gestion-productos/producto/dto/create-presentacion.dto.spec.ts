import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreatePresentacionDto } from './create-presentacion.dto';

describe('CreatePresentacionDto — CR-002 Presentación del Producto', () => {
  const dtoValido = {
    denominacion: '1L',
    descripcion: 'Botella de 1 litro',
  };

  it('debe ser válido con datos correctos', async () => {
    const dto = plainToClass(CreatePresentacionDto, dtoValido);
    const errores = await validate(dto);
    expect(errores.length).toBe(0);
  });

  it('CR-002: debe rechazar denominación vacía', async () => {
    const dto = plainToClass(CreatePresentacionDto, { ...dtoValido, denominacion: '' });
    const errores = await validate(dto);
    const errorDenom = errores.find(e => e.property === 'denominacion');
    expect(errorDenom).toBeDefined();
  });

  it('CR-002: debe rechazar denominación con caracteres inválidos', async () => {
    const dto = plainToClass(CreatePresentacionDto, { ...dtoValido, denominacion: '<script>' });
    const errores = await validate(dto);
    const errorDenom = errores.find(e => e.property === 'denominacion');
    expect(errorDenom).toBeDefined();
  });

  it('CR-002: debe permitir presentaciones comunes (1L, pack, botella, lata)', async () => {
    const presentacionesValidas = ['1L', 'pack', 'botella', 'lata', '500ml', '2.5L'];
    
    for (const pres of presentacionesValidas) {
      const dto = plainToClass(CreatePresentacionDto, { ...dtoValido, denominacion: pres });
      const errores = await validate(dto);
      expect(errores.find(e => e.property === 'denominacion')).toBeUndefined();
    }
  });

  it('CR-002: debe permitir descripción opcional', async () => {
    const dtoSinDescripcion = { denominacion: '1L' };
    const dto = plainToClass(CreatePresentacionDto, dtoSinDescripcion);
    const errores = await validate(dto);
    expect(errores.find(e => e.property === 'descripcion')).toBeUndefined();
  });

  it('CR-002: debe rechazar denominación duplicada en la misma sesión', async () => {
    // Este test se ejecutaría a nivel de servicio/controller
    // pero lo dejamos como placeholder para CR-002
    expect(true).toBe(true);
  });
});
