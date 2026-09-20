import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SuperLinea } from '../linea/domain/entities/super-linea.entity';
import { CreateSuperLineaDto } from './dto/create-super-linea.dto';
import { UpdateSuperLineaDto } from './dto/update-super-linea.dto';

@Injectable()
export class SuperLineaService {
    constructor(
        @InjectRepository(SuperLinea)
        private readonly superLineaRepository: Repository<SuperLinea>,
    ) {}

    async create(dto: CreateSuperLineaDto): Promise<SuperLinea> {
        const existe = await this.superLineaRepository.findOne({
            where: { denominacion: dto.denominacion.toUpperCase() },
        });
        if (existe) throw new BadRequestException(`La SuperLínea "${dto.denominacion}" ya existe.`);

        const nueva = this.superLineaRepository.create({
            ...dto,
            denominacion: dto.denominacion.toUpperCase(),
        });
        return this.superLineaRepository.save(nueva);
    }

    async findAll(skip = 0, take = 10): Promise<{ data: SuperLinea[]; total: number }> {
        const [data, total] = await this.superLineaRepository.findAndCount({
            where: { deletedAt: null },
            relations: ['lineas'],
            skip,
            take,
            order: { denominacion: 'ASC' },
        });
        return { data, total };
    }

    async findOne(id: number): Promise<SuperLinea> {
        const superLinea = await this.superLineaRepository.findOne({
            where: { id },
            relations: ['lineas'],
        });
        if (!superLinea) throw new NotFoundException(`SuperLínea con ID ${id} no encontrada.`);
        return superLinea;
    }

    async update(id: number, dto: UpdateSuperLineaDto): Promise<SuperLinea> {
        const superLinea = await this.findOne(id);
        Object.assign(superLinea, {
            ...dto,
            denominacion: dto.denominacion ? dto.denominacion.toUpperCase() : superLinea.denominacion,
        });
        return this.superLineaRepository.save(superLinea);
    }

    async remove(id: number): Promise<void> {
        const superLinea = await this.findOne(id);
        if (superLinea.lineas && superLinea.lineas.length > 0) {
            throw new BadRequestException('No se puede eliminar una SuperLínea con Líneas asociadas.');
        }
        await this.superLineaRepository.softDelete(id);
    }

    async searchBy(denominacion: string, skip = 0, take = 10) {
        const [data, total] = await this.superLineaRepository.findAndCount({
            where: { deletedAt: null },
            relations: ['lineas'],
            skip,
            take,
            order: { denominacion: 'ASC' },
        });

        const filtrado = data.filter(sl =>
            sl.denominacion.toLowerCase().includes(denominacion.toLowerCase())
        );

        return { data: filtrado, total: filtrado.length };
    }
}