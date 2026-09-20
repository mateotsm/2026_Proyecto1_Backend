import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export enum TipoAjuste {
  PORCENTAJE = 'porcentaje',
  MONTO = 'monto',
}

export enum AlcanceAjuste {
  LINEA = 'linea',
  GLOBAL = 'global',
}

export class ActualizacionMasivaPrecioDto {
  @IsEnum(TipoAjuste, { message: 'El tipo debe ser "porcentaje" o "monto".' })
  tipo: TipoAjuste;

  @IsNumber({}, { message: 'El valor debe ser un número.' })
  valor: number;

  @IsEnum(AlcanceAjuste, { message: 'El alcance debe ser "linea" o "global".' })
  alcance: AlcanceAjuste;

  @IsOptional()
  @IsNumber({}, { message: 'El lineaId debe ser un número.' })
  lineaId?: number;

  @IsString({ message: 'El motivo debe ser texto.' })
  @IsNotEmpty({ message: 'El motivo es obligatorio.' })
  motivo: string;
}