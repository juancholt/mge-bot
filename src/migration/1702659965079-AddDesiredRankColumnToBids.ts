import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDesiredRankColumnToBids1702659965079
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "bid" ADD "desiredRank" smallint DEFAULT '15'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "bid" DROP COLUMN "desiredRank"`);
  }
}
