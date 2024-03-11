import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPowerLossAndEndOfKVK1710156616076
  implements MigrationInterface
{
  name = 'AddPowerLossAndEndOfKVK1710156616076';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "kvk" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "kvk" ADD "powerLoss" bigint NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(`ALTER TABLE "kvk" ADD "endDate" date`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "kvk" DROP COLUMN "endDate"`);
    await queryRunner.query(`ALTER TABLE "kvk" DROP COLUMN "powerLoss"`);
    await queryRunner.query(`ALTER TABLE "kvk" DROP COLUMN "updated_at"`);
  }
}
