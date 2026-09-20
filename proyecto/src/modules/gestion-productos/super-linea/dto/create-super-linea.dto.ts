import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

export class CreateSuperLineaDto {
    @IsString({ message: 'La denominación debe ser texto.' })
    @IsNotEmpty({ message: 'La denominación no puede estar vacía.' })
    @MaxLength(255, { message: 'La denominación no puede superar 255 caracteres.' })
    denominacion: string;
    
    @IsOptional()
    @IsString()
    observacion?: string;
}