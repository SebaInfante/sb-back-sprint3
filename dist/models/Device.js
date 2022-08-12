"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connectionResgisters_1 = __importDefault(require("../db/connectionResgisters"));
const Device = connectionResgisters_1.default.define("app_device_base_info", {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    site_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    group_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    device_key: {
        type: sequelize_1.DataTypes.STRING(24),
        allowNull: false,
    },
    name: {
        type: sequelize_1.DataTypes.STRING(65),
        allowNull: true,
    },
    logo_uri: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    current_version_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    current_version_name: {
        type: sequelize_1.DataTypes.STRING(16),
        allowNull: true,
    },
    person_count: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    face_count: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    disk_space: {
        type: sequelize_1.DataTypes.BIGINT,
        allowNull: true,
    },
    ip: {
        type: sequelize_1.DataTypes.STRING(15),
        allowNull: true,
    },
    last_active_time: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    is_online: {
        type: sequelize_1.DataTypes.TINYINT,
        allowNull: false,
    },
    direction: {
        type: sequelize_1.DataTypes.SMALLINT,
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.TINYINT,
        allowNull: false,
    },
    create_time: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: new Date(),
        allowNull: false,
    },
    create_user: {
        type: sequelize_1.DataTypes.STRING(64),
        allowNull: false
    },
    update_time: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true
    },
    update_user: {
        type: sequelize_1.DataTypes.STRING(64),
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
exports.default = Device;
//# sourceMappingURL=Device.js.map