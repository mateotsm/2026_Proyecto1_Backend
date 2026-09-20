import { MigrationInterface, QueryRunner } from "typeorm";

export class CR007AgregarHistorialPrecio1789871917386 implements MigrationInterface {
    name = 'CR007AgregarHistorialPrecio1789871917386'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`historial_precio\` (\`id\` int NOT NULL AUTO_INCREMENT, \`productoId\` int NOT NULL, \`precioAnterior\` decimal(15,2) NOT NULL, \`precioNuevo\` decimal(15,2) NOT NULL, \`motivo\` text NOT NULL, \`usuarioId\` int NULL, \`fecha\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`producto_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`historial_precio\` ADD CONSTRAINT \`FK_e2f1eed194c44ae80d797cb6d1b\` FOREIGN KEY (\`producto_id\`) REFERENCES \`producto\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`historial_precio\` DROP FOREIGN KEY \`FK_e2f1eed194c44ae80d797cb6d1b\``);
        await queryRunner.query(`DROP TABLE \`historial_precio\``);
    }

}
