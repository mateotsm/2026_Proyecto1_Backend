import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from '../../domain/entities/producto.entity';
import { Marca } from '../../../marca/domain/entities/marca.entity';
import { Linea } from '../../../linea/domain/entities/linea.entity';

@Injectable()
export class DenominacionAutomaticaService {
  constructor(
    @InjectRepository(Producto)
    private productoRepository: Repository<Producto>,
    @InjectRepository(Marca)
    private marcaRepository: Repository<Marca>,
    @InjectRepository(Linea)
    private lineaRepository: Repository<Linea>,
  ) {}

  /**
   * CR-005: Genera denominación automática a partir de Marca + Línea
   * Formato: "MARCA LINEA"
   * Editable manualmente después de generar
   */
  generarDenominacionLocal(marcaDenom: string, lineaDenom: string): string {
    // Normalizar: mayúsculas y trim
    const marcaNorm = marcaDenom.trim().toUpperCase();
    const lineaNorm = lineaDenom.trim().toUpperCase();

    // Generar denominación automática
    const denominacionAutomatica = `${marcaNorm} ${lineaNorm}`;
    return denominacionAutomatica;
  }

  /**
   * CR-005: Crea un producto con denominación automática
   * Permite edición manual posterior
   */
  async crearProductoConDenominacionAutomatica(datos: {
    marcaId: number;
    lineaId: number;
    costo: number;
    precio: number;
    stock: number;
    stockMinimo: number;
    denominacionManual?: string; // Permite override manual
  }): Promise<Producto> {
    // Validar que existan las relaciones
    const marca = await this.marcaRepository.findOne({
      where: { id: datos.marcaId },
    });
    const linea = await this.lineaRepository.findOne({
      where: { id: datos.lineaId },
    });

    if (!marca || !linea) {
      throw new NotFoundException('Marca o Línea no encontradas');
    }

    // Generar denominación automática
    let denominacion = this.generarDenominacionLocal(
      marca.denominacion,
      linea.denominacion,
    );

    // Permitir edición manual
    if (datos.denominacionManual && datos.denominacionManual.trim() !== '') {
      denominacion = datos.denominacionManual.trim();
    }

    // Crear producto
    const producto = this.productoRepository.create({
      denominacion,
      marca,
      linea,
      costo: datos.costo,
      precio: datos.precio,
      stock: datos.stock,
      stockMinimo: datos.stockMinimo,
    });

    return await this.productoRepository.save(producto);
  }

  /**
   * CR-005: Actualizar denominación de un producto existente
   * Simplemente edita el nombre
   */
  async actualizarDenominacionProducto(
    productoId: number,
    nuevaDenominacion: string,
  ): Promise<Producto> {
    const producto = await this.productoRepository.findOne({
      where: { id: productoId },
    });

    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }

    if (!nuevaDenominacion || nuevaDenominacion.trim() === '') {
      throw new BadRequestException('La denominación no puede estar vacía');
    }

    producto.denominacion = nuevaDenominacion.trim();
    return await this.productoRepository.save(producto);
  }
}

