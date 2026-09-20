import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuperLineaService } from './super-linea.service';
import { SuperLineaController } from './super-linea.controller';
import { SuperLinea } from '../linea/domain/entities/super-linea.entity';
import { JwtModule } from '@nestjs/jwt';
import { Usuario } from 'src/modules/gestion-usuario/usuario/domain/entities/usuario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SuperLinea, Usuario]),
    JwtModule,
  ],
  controllers: [SuperLineaController],
  providers: [SuperLineaService],
  exports: [SuperLineaService],
})
export class SuperLineaModule {}