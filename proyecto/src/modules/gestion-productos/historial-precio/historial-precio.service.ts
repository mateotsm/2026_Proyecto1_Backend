import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HistorialPrecio } from '../producto/domain/entities/historial-precio.entity';

@Injectable()
export class HistorialPrecioService {
  constructor(
    @InjectRepository(HistorialPrecio)
    private readonly historialRepository: Repository<HistorialPrecio>,
  ) {}

  async registrar(
    productoId: number,
    precioAnterior: number,
    precioNuevo: number,
    motivo: string,
    usuarioId?: number,
  ): Promise<HistorialPrecio> {
    const registro = this.historialRepository.create({
      productoId,
      precioAnterior,
      precioNuevo,
      motivo,
      usuarioId,
    });
    return this.historialRepository.save(registro);
  }

  async findByProducto(
    productoId: number,
    skip = 0,
    take = 10,
  ): Promise<{ data: HistorialPrecio[]; total: number }> {
    const [data, total] = await this.historialRepository.findAndCount({
      where: { productoId },
      order: { fecha: 'DESC' },
      skip,
      take,
    });
    return { data, total };
  }

  async findAll(
    skip = 0,
    take = 10,
  ): Promise<{ data: HistorialPrecio[]; total: number }> {
    const [data, total] = await this.historialRepository.findAndCount({
      order: { fecha: 'DESC' },
      relations: ['producto'],
      skip,
      take,
    });
    return { data, total };
  }
}