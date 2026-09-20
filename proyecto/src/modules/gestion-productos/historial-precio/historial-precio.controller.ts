import {
  Controller, Get, Param, Query,
  ParseIntPipe, UseGuards
} from '@nestjs/common';
import { HistorialPrecioService } from './historial-precio.service';
import { AuthGuard } from 'src/modules/gestion-usuario/auth/auth.guard';
import { Roles } from 'src/modules/gestion-usuario/auth/roles.decorator';

@Controller('historial-precio')
@UseGuards(AuthGuard)
export class HistorialPrecioController {
  constructor(private readonly historialPrecioService: HistorialPrecioService) {}

  @Get()
  @Roles('Administrador', 'Root', 'Empleado')
  findAll(
    @Query('skip') skip = 0,
    @Query('take') take = 10,
  ) {
    return this.historialPrecioService.findAll(+skip, +take);
  }

  @Get('producto/:productoId')
  @Roles('Administrador', 'Root', 'Empleado', 'Vendedor', 'Repositor')
  findByProducto(
    @Param('productoId', ParseIntPipe) productoId: number,
    @Query('skip') skip = 0,
    @Query('take') take = 10,
  ) {
    return this.historialPrecioService.findByProducto(productoId, +skip, +take);
  }
}