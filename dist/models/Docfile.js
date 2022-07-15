"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connectionResgisters_1 = __importDefault(require("../db/connectionResgisters"));
//Colcar las columnas de la bd que se actualizan en este caso el id no va porque es autoincrementable
const Docfile = connectionResgisters_1.default.define("app_docfile", {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    employment_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false
    },
    person_no: {
        type: sequelize_1.DataTypes.STRING(16),
        allowNull: false
    },
    document_name: {
        type: sequelize_1.DataTypes.STRING(64),
        allowNull: false
    },
    document_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false
    },
    docfile_url: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false
    },
    docfile_alias: {
        type: sequelize_1.DataTypes.STRING(128),
        allowNull: false
    },
    docfile_size: {
        type: sequelize_1.DataTypes.SMALLINT,
        allowNull: false
    },
    docfile_suffix: {
        type: sequelize_1.DataTypes.STRING(8),
        allowNull: false
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
exports.default = Docfile;
//# sourceMappingURL=Docfile.js.map