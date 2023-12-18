import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeDiscordFieldNullable1702506938654
  implements MigrationInterface
{
  name = 'MakeDiscordFieldNullable1702506938654';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "governor" ALTER COLUMN "discordId" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "governor" ALTER COLUMN "discordId" SET NOT NULL`,
    );
  }
}
