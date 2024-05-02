import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameKvk1714340715501 implements MigrationInterface {
  name = 'RenameKvk1714340715501';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "kvk" DROP CONSTRAINT "FK_3dd3e97f4de7cc3129e56530a97"`,
    );
    await queryRunner.query(
      `ALTER TABLE "kvk" DROP CONSTRAINT "PK_53d9a8fb7db77c13729c4c1fabe"`,
    );
    await queryRunner.query(`ALTER TABLE "kvk" DROP COLUMN "activeKvk"`);
    await queryRunner.renameTable('kvk', 'kvk_stats');
    await queryRunner.query(
      `ALTER TABLE "ranked_event" ALTER COLUMN "reservedPlaces" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "bid" ALTER COLUMN "desiredRank" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameTable('kvk_stats', 'kvk');
    await queryRunner.query(
      `ALTER TABLE "bid" ALTER COLUMN "desiredRank" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "ranked_event" ALTER COLUMN "reservedPlaces" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "kvk" ADD "activeKvk" boolean NOT NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "kvk" ADD CONSTRAINT "FK_stat_for_governor" FOREIGN KEY ("governorId") REFERENCES "governor"("governorId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "kvk" ADD CONSTRAINT "PK_53d9a8fb7db77c13729c4c1fabe" PRIMARY KEY ("id")`,
    );
  }
}
