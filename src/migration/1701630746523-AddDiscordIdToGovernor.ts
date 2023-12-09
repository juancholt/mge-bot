import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDiscordIdToGovernor1701630746523 implements MigrationInterface {
  name = 'AddDiscordIdToGovernor1701630746523';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "governor" ADD "discordId" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "governor" ADD CONSTRAINT "UQ_db27a674a5eb18fc55415ac8cd7" UNIQUE ("discordId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "governor" DROP CONSTRAINT "UQ_db27a674a5eb18fc55415ac8cd7"`,
    );
    await queryRunner.query(`ALTER TABLE "governor" DROP COLUMN "discordId"`);
  }
}
