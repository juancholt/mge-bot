import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddKVKTable1705799546690 implements MigrationInterface {
  name = 'AddKVKTable1705799546690';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "kvk" ("id" SERIAL NOT NULL, "matchMakingPower" bigint NOT NULL DEFAULT '0', "t4Kills" bigint NOT NULL DEFAULT '0', "t5Kills" bigint NOT NULL DEFAULT '0', "deadTroops" bigint NOT NULL DEFAULT '0', "activeKvk" boolean NOT NULL, "score" bigint NOT NULL DEFAULT '0', "governorId" character varying, CONSTRAINT "PK_53d9a8fb7db77c13729c4c1fabe" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "governor" DROP COLUMN "power"`);
    await queryRunner.query(
      `ALTER TABLE "governor" DROP COLUMN "lastPowerUpdate"`,
    );
    await queryRunner.query(
      `ALTER TABLE "kvk" ADD CONSTRAINT "FK_3dd3e97f4de7cc3129e56530a97" FOREIGN KEY ("governorId") REFERENCES "governor"("governorId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "kvk" DROP CONSTRAINT "FK_3dd3e97f4de7cc3129e56530a97"`,
    );
    await queryRunner.query(
      `ALTER TABLE "governor" ADD "power" bigint NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "governor" ADD "lastPowerUpdate" date DEFAULT '2024-01-01'`,
    );
    await queryRunner.query(`DROP TABLE "kvk"`);
  }
}
