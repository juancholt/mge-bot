import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGovernorBidAndRankedEvent1701568824252
  implements MigrationInterface
{
  name = 'AddGovernorBidAndRankedEvent1701568824252';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "ranked_event" ("id" SERIAL NOT NULL, "places" smallint NOT NULL, CONSTRAINT "PK_9bc237b59cc6965c8fa3ea454a1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "bid" ("id" SERIAL NOT NULL, "amount" bigint NOT NULL, "status" character varying NOT NULL, "governorId" integer, "rankedEventId" integer, CONSTRAINT "PK_ed405dda320051aca2dcb1a50bb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_a0e4f63808fa5b82487bc8b469" ON "bid" ("governorId", "rankedEventId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "governor" ("id" SERIAL NOT NULL, "governorId" character varying NOT NULL, "governorName" character varying(30) NOT NULL, "points" bigint NOT NULL, CONSTRAINT "UQ_30f1aa3e5a6a1c45ae3b14d6a4d" UNIQUE ("governorId"), CONSTRAINT "PK_d125c053be5cf8b57b4c882867f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "bid" ADD CONSTRAINT "FK_2d129650cc749e6f5ace20ec308" FOREIGN KEY ("governorId") REFERENCES "governor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bid" ADD CONSTRAINT "FK_8f57fb6252545a8c242643eeda4" FOREIGN KEY ("rankedEventId") REFERENCES "ranked_event"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "bid" DROP CONSTRAINT "FK_8f57fb6252545a8c242643eeda4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bid" DROP CONSTRAINT "FK_2d129650cc749e6f5ace20ec308"`,
    );
    await queryRunner.query(`DROP TABLE "governor"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a0e4f63808fa5b82487bc8b469"`,
    );
    await queryRunner.query(`DROP TABLE "bid"`);
    await queryRunner.query(`DROP TABLE "ranked_event"`);
  }
}
