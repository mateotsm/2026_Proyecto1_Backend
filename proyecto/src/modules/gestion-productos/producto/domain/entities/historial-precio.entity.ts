import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Producto } from './producto.entity';

@Entity('historial_precio')
export class HistorialPrecio {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Producto, (producto) => producto.historialPrecios)
    @JoinColumn({ name: 'producto_id' })
    producto: Producto;

    @Column({ type: 'int' })
    productoId: number;

    @Column({ type: 'decimal', precision: 15, scale: 2 })
    precioAnterior: number;

    @Column({ type: 'decimal', precision: 15, scale: 2 })
    precioNuevo: number;

    @Column({ type: 'text' })
    motivo: string;

    @Column({ type: 'int', nullable: true })
    usuarioId?: number;

    @CreateDateColumn()
    fecha: Date;
}