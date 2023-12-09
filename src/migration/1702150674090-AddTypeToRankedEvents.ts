import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTypeToRankedEvents1702150674090 implements MigrationInterface {
  name = 'AddTypeToRankedEvents1702150674090';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."ranked_event_type_enum" AS ENUM('Cavalry MGE', 'Infantry MGE', 'Archers MGE', 'Leadership MGE', 'Gold Head Event')`,
    );
    await queryRunner.query(
      `ALTER TABLE "ranked_event" ADD "type" "public"."ranked_event_type_enum" NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "ranked_event" DROP COLUMN "type"`);
    await queryRunner.query(`DROP TYPE "public"."ranked_event_type_enum"`);
  }
}
