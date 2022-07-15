"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connectionResgisters_1 = __importDefault(require("../db/connectionResgisters"));
const Pass_Record = connectionResgisters_1.default.define("app_pass_records", {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    group_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true
    },
    group_name: {
        type: sequelize_1.DataTypes.STRING(32),
        allowNull: true
    },
    // employment_id: {
    //     type: DataTypes.INTEGER,
    //     allowNull:true
    // },
    // employment_name: {
    //     type: DataTypes.STRING(32),
    //     allowNull:true
    // },
    pass_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false
    },
    pass_type: {
        type: sequelize_1.DataTypes.STRING(32),
        allowNull: true
    },
    pass_direction: {
        type: sequelize_1.DataTypes.TINYINT,
        allowNull: false
    },
    pass_time: {
        type: sequelize_1.DataTypes.TIME,
        allowNull: true
    },
    pass_img_url: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true
    },
    pass_temperature: {
        type: sequelize_1.DataTypes.STRING(8),
        allowNull: true
    },
    pass_temperature_state: {
        type: sequelize_1.DataTypes.TINYINT,
        allowNull: true
    },
    pass_device_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true
    },
    pass_id_card: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true
    },
    pass_person_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true
    },
    pass_person_type: {
        type: sequelize_1.DataTypes.TINYINT,
        allowNull: true
    },
    person_no: {
        type: sequelize_1.DataTypes.STRING(16),
        allowNull: true
    },
    person_name: {
        type: sequelize_1.DataTypes.STRING(128),
        allowNull: true
    },
    person_resource_url: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false
    },
    calculated_shift: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true
    },
    pass_create_time: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: new Date(),
        allowNull: false,
    },
    pass_create_user: {
        type: sequelize_1.DataTypes.STRING(32),
        allowNull: false
    },
    pass_update_time: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true
    },
    pass_update_user: {
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
exports.default = Pass_Record;
//# sourceMappingURL=Pass_Record.js.map