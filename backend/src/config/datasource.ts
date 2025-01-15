import { DataSource } from "typeorm";
import { Conversion } from "../models/conversion.model";
import 'dotenv/config';

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "currency_converter",
  synchronize: false,
  logging: process.env.NODE_ENV === "development",
  entities: [Conversion],
  migrations: ["src/migrations/*.ts"],
  subscribers: [],
}); 