import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateConversionTable1706123456789 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "conversions",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        generationStrategy: "uuid",
                        default: "uuid_generate_v4()"
                    },
                    {
                        name: "userId",
                        type: "varchar"
                    },
                    {
                        name: "fromCurrency",
                        type: "varchar"
                    },
                    {
                        name: "toCurrency",
                        type: "varchar"
                    },
                    {
                        name: "amount",
                        type: "decimal",
                        precision: 18,
                        scale: 8
                    },
                    {
                        name: "result",
                        type: "decimal",
                        precision: 18,
                        scale: 8
                    },
                    {
                        name: "responseBody",
                        type: "jsonb"
                    },
                    {
                        name: "createdAt",
                        type: "timestamp",
                        default: "now()"
                    }
                ]
            }),
            true
        );

        // Create index on userId and createdAt for rate limiting queries
        await queryRunner.query(`
            CREATE INDEX idx_conversions_userid_createdat 
            ON conversions(userId, createdAt)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("conversions");
    }
} 