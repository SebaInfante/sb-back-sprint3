"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connectionResgisters_1 = __importDefault(require("../db/connectionResgisters"));
const Person = connectionResgisters_1.default.define("app_person", {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    smart_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true
    },
    person_no: {
        type: sequelize_1.DataTypes.STRING(16),
        allowNull: false
    },
    person_name: {
        type: sequelize_1.DataTypes.STRING(128),
        allowNull: false
    },
    gender: {
        type: sequelize_1.DataTypes.TINYINT,
        allowNull: false
    },
    employee_name: {
        type: sequelize_1.DataTypes.STRING(32),
        allowNull: false
    },
    employment_name: {
        type: sequelize_1.DataTypes.STRING(64),
        allowNull: false,
        defaultValue: 'No seleccionado',
    },
    id_finger: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    id_qr: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true
    },
    qr_url: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: sequelize_1.DataTypes.STRING(128),
        allowNull: true
    },
    phone: {
        type: sequelize_1.DataTypes.STRING(16),
        allowNull: true
    },
    avatar_url: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false
    },
    avatar_alias: {
        type: sequelize_1.DataTypes.STRING(128),
        allowNull: false
    },
    avatar_size: {
        type: sequelize_1.DataTypes.SMALLINT,
        allowNull: false
    },
    avatar_dimensions: {
        type: sequelize_1.DataTypes.STRING(16),
        allowNull: false
    },
    avatar_suffix: {
        type: sequelize_1.DataTypes.STRING(8),
        allowNull: false
    },
    status: {
        type: sequelize_1.DataTypes.TINYINT,
        defaultValue: 1,
        allowNull: false
    },
    remark: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true
    },
    create_time: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: new Date(),
        allowNull: false
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
exports.default = Person;
//# sourceMappingURL=Person.js.map