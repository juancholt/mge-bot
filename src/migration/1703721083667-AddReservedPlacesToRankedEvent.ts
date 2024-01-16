import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReservedPlacesToRankedEvent1703721083667
  implements MigrationInterface
{
  name = 'AddReservedPlacesToRankedEvent1703721083667';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ranked_event" ADD "reservedPlaces" smallint DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ranked_event" DROP COLUMN "reservedPlaces"`,
    );
  }
}
