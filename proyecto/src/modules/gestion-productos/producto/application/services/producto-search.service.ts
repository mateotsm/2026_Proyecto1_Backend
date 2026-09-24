import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from '../../domain/entities/producto.entity';

@Injectable()
export class ProductoSearchService {
  constructor(
    @InjectRepository(Producto)
    private productoRepository: Repository<Producto>,
  ) {}

  // CR-004: Búsqueda por denominación con coincidencias parciales
  async buscarPorDenominacion(denominacion: string, page = 0, limit = 10) {
    const query = this.productoRepository
      .createQueryBuilder('producto')
      .leftJoinAndSelect('producto.linea', 'linea')
      .leftJoinAndSelect('producto.marca', 'marca')
      .leftJoinAndSelect('linea.superLinea', 'superLinea');

    if (denominacion && denominacion.trim()) {
      query.where('producto.denominacion ILIKE :denominacion', {
        denominacion: `%${denominacion}%`,
      });
    }

    const [data, total] = await query
      .skip(page * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  // CR-004: Búsqueda por ID de Línea
  async buscarPorLinea(lineaId: number, page = 0, limit = 10) {
    const [data, total] = await this.productoRepository
      .createQueryBuilder('producto')
      .leftJoinAndSelect('producto.linea', 'linea')
      .leftJoinAndSelect('producto.marca', 'marca')
      .leftJoinAndSelect('linea.superLinea', 'superLinea')
      .where('linea.id = :lineaId', { lineaId })
      .skip(page * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  // CR-004: Búsqueda por denominación de Línea
  async buscarPorLineaDenominacion(lineaDenom: string, page = 0, limit = 10) {
    const [data, total] = await this.productoRepository
      .createQueryBuilder('producto')
      .leftJoinAndSelect('producto.linea', 'linea')
      .leftJoinAndSelect('producto.marca', 'marca')
      .leftJoinAndSelect('linea.superLinea', 'superLinea')
      .where('linea.denominacion ILIKE :lineaDenom', {
        lineaDenom: `%${lineaDenom}%`,
      })
      .skip(page * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  // CR-004: Búsqueda por ID de SuperLínea
  async buscarPorSuperLinea(superLineaId: number, page = 0, limit = 10) {
    const [data, total] = await this.productoRepository
      .createQueryBuilder('producto')
      .leftJoinAndSelect('producto.linea', 'linea')
      .leftJoinAndSelect('producto.marca', 'marca')
      .leftJoinAndSelect('linea.superLinea', 'superLinea')
      .where('superLinea.id = :superLineaId', { superLineaId })
      .skip(page * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  // CR-004: Búsqueda por denominación de SuperLínea
  async buscarPorSuperLineaDenominacion(
    superLineaDenom: string,
    page = 0,
    limit = 10,
  ) {
    const [data, total] = await this.productoRepository
      .createQueryBuilder('producto')
      .leftJoinAndSelect('producto.linea', 'linea')
      .leftJoinAndSelect('producto.marca', 'marca')
      .leftJoinAndSelect('linea.superLinea', 'superLinea')
      .where('superLinea.denominacion ILIKE :superLineaDenom', {
        superLineaDenom: `%${superLineaDenom}%`,
      })
      .skip(page * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }
}