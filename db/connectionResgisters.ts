import { Sequelize } from "sequelize";
import 'dotenv/config'

const host: string = process.env.BD_REG_HOST || "";
const name: string = process.env.BD_REG_NAME || "";
const user: string = process.env.BD_REG_USER || "";
const pass: string = process.env.BD_REG_PASSWORD || ""

const db = new Sequelize(name, user, pass, {
    host,
    port:1433,
    // dialect: "mysql",
    dialect: "mssql",
    logging: false,
});

export default db;
