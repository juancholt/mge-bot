import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRequirementsAndKvk1714692210626 implements MigrationInterface {
  name = 'AddRequirementsAndKvk1714692210626';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "kvk_requirement" ("id" SERIAL NOT NULL, "minimumPower" bigint NOT NULL DEFAULT '0', "maximumPower" bigint, "requiredPowerLoss" bigint NOT NULL DEFAULT '0', "requiredKills" bigint NOT NULL DEFAULT '0', "kvkId" integer, CONSTRAINT "PK_a01fa393419e493972ac210eb2f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."kvk_type_enum" AS ENUM('Tides of War', 'Strife of the Eight', 'Warriors Unbound', 'King of the Nile', 'Heroic Anthem', 'Siege of Orleans', 'Alliance Invictus', 'Storm of Stratagems', 'Desert Conquest')`,
    );
    await queryRunner.query(
      `CREATE TABLE "kvk" ("id" SERIAL NOT NULL, "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "type" "public"."kvk_type_enum" NOT NULL, "endDate" date, "active" boolean NOT NULL, CONSTRAINT "PK_53d9a8fb7db77c13729c4c1fabe" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "kvk_stats" ADD "kvkId" integer`);
    await queryRunner.query(
      `ALTER TABLE "kvk_stats" ADD CONSTRAINT "PK_a4b4f2c160130c215ecc0b04817" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "kvk_requirement" ADD CONSTRAINT "FK_ad135137af92ccd66be36839013" FOREIGN KEY ("kvkId") REFERENCES "kvk"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "kvk_stats" ADD CONSTRAINT "FK_40178fa57859e2741dde705ee57" FOREIGN KEY ("governorId") REFERENCES "governor"("governorId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "kvk_stats" ADD CONSTRAINT "FK_3280bec6d1e255c506a07ee4356" FOREIGN KEY ("kvkId") REFERENCES "kvk"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "kvk_stats" DROP CONSTRAINT "FK_3280bec6d1e255c506a07ee4356"`,
    );
    await queryRunner.query(
      `ALTER TABLE "kvk_stats" DROP CONSTRAINT "FK_40178fa57859e2741dde705ee57"`,
    );
    await queryRunner.query(
      `ALTER TABLE "kvk_requirement" DROP CONSTRAINT "FK_ad135137af92ccd66be36839013"`,
    );
    await queryRunner.query(
      `ALTER TABLE "kvk_stats" DROP CONSTRAINT "PK_a4b4f2c160130c215ecc0b04817"`,
    );
    await queryRunner.query(`ALTER TABLE "kvk_stats" DROP COLUMN "kvkId"`);
    await queryRunner.query(`DROP TABLE "kvk"`);
    await queryRunner.query(`DROP TYPE "public"."kvk_type_enum"`);
    await queryRunner.query(`DROP TABLE "kvk_requirement"`);
  }
}
