"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connectionResgisters_1 = __importDefault(require("../db/connectionResgisters"));
const Employment = connectionResgisters_1.default.define("app_employment", {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    mandante: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    employee: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    name: {
        type: sequelize_1.DataTypes.STRING(64),
        allowNull: true,
    },
    create_time: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: new Date(),
        allowNull: false,
    },
    create_user: {
        type: sequelize_1.DataTypes.STRING(32),
        allowNull: false
    },
    update_time: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true
    },
    update_user: {
        type: sequelize_1.DataTypes.STRING(32),
        allowNull: true
    },
    deleted_flag: {
        type: sequelize_1.DataTypes.TINYINT,
        defaultValue: 0,
        allowNull: false
    },
}, {
    freezeTableName: true,
    createdAt: false,
    updatedAt: false,
});
exports.default = Employment;
//# sourceMappingURL=Employment.js.map