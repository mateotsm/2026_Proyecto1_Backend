import { MigrationInterface, QueryRunner } from "typeorm";

export class CR002AgregarPresentacionProducto1789789206574 implements MigrationInterface {
    name = 'CR002AgregarPresentacionProducto1789789206574'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`producto\` ADD \`presentacion\` varchar(100) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`producto\` DROP COLUMN \`presentacion\``);
    }

}
