import { IsString, IsNotEmpty, IsOptional, MaxLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreatePresentacionDto {
  @Transform(({ value }) => value?.trim().toUpperCase())
  @IsString({ message: 'La presentación debe ser texto.' })
  @IsNotEmpty({ message: 'La presentación no puede estar vacía.' })
  @MaxLength(50, { message: 'La presentación no puede superar 50 caracteres.' })
  @Matches(/^[A-Za-z0-9\s.,\-/()]+$/, {
    message: 'La presentación contiene caracteres inválidos.',
  })
  denominacion: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser texto.' })
  @MaxLength(200, { message: 'La descripción no puede superar 200 caracteres.' })
  descripcion?: string;
}
