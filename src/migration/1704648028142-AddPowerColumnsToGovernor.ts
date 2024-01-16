import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPowerColumnsToGovernor1704648028142
  implements MigrationInterface
{
  name = 'AddPowerColumnsToGovernor1704648028142';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "governor" ADD "power" bigint NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "governor" ADD "lastPowerUpdate" date DEFAULT '2024-01-01'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "governor" DROP COLUMN "lastPowerUpdate"`,
    );
    await queryRunner.query(`ALTER TABLE "governor" DROP COLUMN "power"`);
  }
}
