import {
    Controller, Get, Post, Put, Delete,
    Param, Body, Query, ParseIntPipe, UseGuards
} from '@nestjs/common';
import { SuperLineaService } from './super-linea.service';
import { CreateSuperLineaDto } from './dto/create-super-linea.dto';
import { UpdateSuperLineaDto } from './dto/update-super-linea.dto';
import { AuthGuard } from 'src/modules/gestion-usuario/auth/auth.guard';
import { Roles } from 'src/modules/gestion-usuario/auth/roles.decorator';

@Controller('super-linea')
@UseGuards(AuthGuard)
export class SuperLineaController {
    constructor(private readonly superLineaService: SuperLineaService) {}

    @Post()
    @Roles('Administrador', 'Root')
    create(@Body() dto: CreateSuperLineaDto) {
        return this.superLineaService.create(dto);
    }

    @Get()
    @Roles('Administrador', 'Root', 'Empleado', 'Vendedor', 'Repositor', 'Repartidor', 'Cobrador')
    findAll(
        @Query('skip') skip = 0,
        @Query('take') take = 10,
    ) {
        return this.superLineaService.findAll(+skip, +take);
    }

    @Get('search-by')
    @Roles('Administrador', 'Root', 'Empleado', 'Vendedor', 'Repositor', 'Repartidor', 'Cobrador')
    searchBy(
        @Query('denominacion') denominacion = '',
        @Query('skip') skip = 0,
        @Query('take') take = 10,
    ) {
        return this.superLineaService.searchBy(denominacion, +skip, +take);
    }

    @Get(':id')
    @Roles('Administrador', 'Root', 'Empleado', 'Vendedor', 'Repositor', 'Repartidor', 'Cobrador')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.superLineaService.findOne(id);
    }

    @Put(':id')
    @Roles('Administrador', 'Root')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateSuperLineaDto,
    ) {
        return this.superLineaService.update(id, dto);
    }

    @Delete(':id')
    @Roles('Administrador', 'Root')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.superLineaService.remove(id);
    }
}