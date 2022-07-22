"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connectionResgisters_1 = __importDefault(require("../db/connectionResgisters"));
//Colcar las columnas de la bd que se actualizan en este caso el id no va porque es autoincrementable
const Shift_Config = connectionResgisters_1.default.define("app_shift_config", {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    group_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    group_name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    shift_name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    start_time: {
        type: sequelize_1.DataTypes.TIME,
        allowNull: false,
    },
    end_time: {
        type: sequelize_1.DataTypes.TIME,
        allowNull: false,
    },
    start_early: {
        type: sequelize_1.DataTypes.TIME,
        allowNull: false,
    },
    start_late: {
        type: sequelize_1.DataTypes.TIME,
        allowNull: false,
    },
    end_early: {
        type: sequelize_1.DataTypes.TIME,
        allowNull: false,
    },
    end_late: {
        type: sequelize_1.DataTypes.TIME,
        allowNull: false,
    },
    initial_date: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    final_date: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    remark: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    type: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: true
    },
    lunes: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: true
    },
    martes: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: true
    },
    miercoles: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: true
    },
    jueves: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: true
    },
    viernes: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: true
    },
    sabado: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: true
    },
    domingo: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: true
    },
    create_time: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: new Date(),
        allowNull: false,
    },
    create_user: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
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
exports.default = Shift_Config;
//# sourceMappingURL=Shift_Config.js.map