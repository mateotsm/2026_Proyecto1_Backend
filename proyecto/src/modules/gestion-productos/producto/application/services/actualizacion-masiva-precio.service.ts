import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from '../../domain/entities/producto.entity';
import { HistorialPrecioService } from '../../../historial-precio/historial-precio.service';
import {
  ActualizacionMasivaPrecioDto,
  AlcanceAjuste,
  TipoAjuste,
} from '../../dto/actualizacion-masiva-precio.dto';

@Injectable()
export class ActualizacionMasivaPrecioService {
  constructor(
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
    private readonly historialPrecioService: HistorialPrecioService,
  ) {}

  async actualizarPrecios(
    dto: ActualizacionMasivaPrecioDto,
    usuarioId?: number,
  ): Promise<{ actualizados: number; errores: string[] }> {
    const errores: string[] = [];

    // Obtener productos según alcance
    const query = this.productoRepository
      .createQueryBuilder('p')
      .where('p.deletedAt IS NULL');

    if (dto.alcance === AlcanceAjuste.LINEA) {
      if (!dto.lineaId) {
        throw new BadRequestException(
          'El lineaId es obligatorio cuando el alcance es "linea".',
        );
      }
      query.andWhere('p.lineaId = :lineaId', { lineaId: dto.lineaId });
    }

    const productos = await query.getMany();

    if (productos.length === 0) {
      throw new BadRequestException('No se encontraron productos para actualizar.');
    }

    let actualizados = 0;

    for (const producto of productos) {
      const precioAnterior = Number(producto.precio);
      let precioNuevo: number;

      if (dto.tipo === TipoAjuste.PORCENTAJE) {
        precioNuevo = precioAnterior * (1 + dto.valor / 100);
      } else {
        precioNuevo = precioAnterior + dto.valor;
      }

      precioNuevo = Math.round(precioNuevo * 100) / 100;

      if (precioNuevo <= 0) {
        errores.push(
          `Producto ID ${producto.id} (${producto.denominacion}): el precio resultante sería ${precioNuevo}, debe ser mayor a 0.`,
        );
        continue;
      }

      producto.precio = precioNuevo;
      await this.productoRepository.save(producto);

      await this.historialPrecioService.registrar(
        producto.id,
        precioAnterior,
        precioNuevo,
        dto.motivo,
        usuarioId,
      );

      actualizados++;
    }

    return { actualizados, errores };
  }
}