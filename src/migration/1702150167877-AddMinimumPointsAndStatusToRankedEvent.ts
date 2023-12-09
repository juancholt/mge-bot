import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMinimumPointsAndStatusToRankedEvent1702150167877
  implements MigrationInterface
{
  name = 'AddMinimumPointsAndStatusToRankedEvent1702150167877';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ranked_event" ADD "minimumScore" integer NOT NULL`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."ranked_event_status_enum" AS ENUM('active', 'finished')`,
    );
    await queryRunner.query(
      `ALTER TABLE "ranked_event" ADD "status" "public"."ranked_event_status_enum" NOT NULL DEFAULT 'finished'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "ranked_event" DROP COLUMN "status"`);
    await queryRunner.query(`DROP TYPE "public"."ranked_event_status_enum"`);
    await queryRunner.query(
      `ALTER TABLE "ranked_event" DROP COLUMN "minimumScore"`,
    );
  }
}
