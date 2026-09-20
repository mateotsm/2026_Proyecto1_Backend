import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistorialPrecioService } from './historial-precio.service';
import { HistorialPrecioController } from './historial-precio.controller';
import { HistorialPrecio } from '../producto/domain/entities/historial-precio.entity';
import { JwtModule } from '@nestjs/jwt';
import { Usuario } from 'src/modules/gestion-usuario/usuario/domain/entities/usuario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([HistorialPrecio, Usuario]),
    JwtModule,
  ],
  controllers: [HistorialPrecioController],
  providers: [HistorialPrecioService],
  exports: [HistorialPrecioService],
})
export class HistorialPrecioModule {}