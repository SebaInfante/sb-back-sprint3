import { DataTypes } from "sequelize";
import db from "../db/connectionResgisters";

const Device = db.define<any>(
    "app_device_base_info",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement:true,
            allowNull:false
        },
        site_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        group_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        device_key: {
            type: DataTypes.STRING(24),
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING(65),
            allowNull: true,
        },
        logo_uri: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        current_version_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        current_version_name: {
            type: DataTypes.STRING(16),
            allowNull: true,
        },
        person_count: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        face_count: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        disk_space: {
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        ip: {
            type: DataTypes.STRING(15),
            allowNull: true,
        },
        last_active_time: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        is_online: {
            type: DataTypes.TINYINT,
            allowNull: false,
        },
        direction: {
            type: DataTypes.SMALLINT,
            allowNull: false,
        },
        status: {
            type: DataTypes.TINYINT,
            allowNull: false,
        },
        create_time: {
            type: DataTypes.DATE,
            defaultValue: new Date(),
            allowNull: false,
        },
        create_user: {
            type: DataTypes.STRING(64),
            allowNull:false
        },
        update_time: {
            type: DataTypes.DATE,
            allowNull:true
        },
        update_user: {
            type: DataTypes.STRING(64),
            allowNull:true
        },
        deleted_flag: {
            type: DataTypes.TINYINT,
            defaultValue:0,
            allowNull:false
        },
    },
    {
        freezeTableName: true,
        createdAt: false,
        updatedAt: false,
    }
);

export default Device;