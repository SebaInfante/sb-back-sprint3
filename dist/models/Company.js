"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connectionResgisters_1 = __importDefault(require("../db/connectionResgisters"));
const Company = connectionResgisters_1.default.define("app_company", { id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    name: {
        type: sequelize_1.DataTypes.STRING(32),
        allowNull: false
    },
    rut: {
        type: sequelize_1.DataTypes.STRING(16),
        allowNull: false
    },
    role: {
        type: sequelize_1.DataTypes.STRING(3),
        allowNull: false
    },
    mandante: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true
    },
    email: {
        type: sequelize_1.DataTypes.STRING(64),
        allowNull: true
    },
    razon: {
        type: sequelize_1.DataTypes.STRING(64),
        allowNull: true
    },
    contacto: {
        type: sequelize_1.DataTypes.STRING(64),
        allowNull: true
    },
    fono: {
        type: sequelize_1.DataTypes.STRING(16),
        allowNull: true
    },
    create_time: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: new Date(),
        allowNull: false,
    },
    create_user: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    update_time: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true
    },
    update_user: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    deleted_flag: {
        type: sequelize_1.DataTypes.TINYINT,
        defaultValue: 0,
        allowNull: false,
    },
}, {
    freezeTableName: true,
    createdAt: false,
    updatedAt: false,
});
exports.default = Company;
//# sourceMappingURL=Company.js.map