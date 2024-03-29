"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
require("dotenv/config");
const host = process.env.BD_REG_HOST || "";
const name = process.env.BD_REG_NAME || "";
const user = process.env.BD_REG_USER || "";
const pass = process.env.BD_REG_PASSWORD || "";
const db = new sequelize_1.Sequelize(name, user, pass, {
    host,
    port: 1433,
    // dialect: "mysql",
    dialect: "mssql",
    logging: false,
});
exports.default = db;
//# sourceMappingURL=connectionResgisters.js.map