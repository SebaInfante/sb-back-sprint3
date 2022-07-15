import { DataTypes } from "sequelize";
import db from "../db/connectionResgisters";

const Pass_Record = db.define<any>(
    "app_pass_records",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement:true,
            allowNull:false
        },
        group_id: {
            type: DataTypes.INTEGER,
            allowNull:true
        },
        group_name: {
            type: DataTypes.STRING(32),
            allowNull:true
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
            type: DataTypes.INTEGER,
            allowNull:false
        },
        pass_type: {
            type: DataTypes.STRING(32),
            allowNull:true
        },
        pass_direction: {
            type: DataTypes.TINYINT,
            allowNull:false
        },
        pass_time: {
            type: DataTypes.TIME,
            allowNull:true
        },
        pass_img_url: {
            type: DataTypes.STRING(255),
            allowNull:true
        },
        pass_temperature: {
            type: DataTypes.STRING(8),
            allowNull:true
        },
        pass_temperature_state: {
            type: DataTypes.TINYINT,
            allowNull:true
        },
        pass_device_id: {
            type: DataTypes.INTEGER,
            allowNull:true
        },
        pass_id_card: {
            type: DataTypes.STRING(255),
            allowNull:true
        },
        pass_person_id: {
            type: DataTypes.INTEGER,
            allowNull:true
        },
        pass_person_type: {
            type: DataTypes.TINYINT,
            allowNull:true
        },
        person_no: {
            type: DataTypes.STRING(16),
            allowNull:true
        },
        person_name: {
            type: DataTypes.STRING(128),
            allowNull:true
        },
        person_resource_url: {
            type: DataTypes.STRING(255),
            allowNull:false
        },
        calculated_shift: {
            type: DataTypes.STRING(255),
            allowNull:true
        },
        pass_create_time: {
            type: DataTypes.DATE,
            defaultValue: new Date(),
            allowNull: false,
        },
        pass_create_user: {
            type: DataTypes.STRING(32),
            allowNull:false
        },
        pass_update_time: {
            type: DataTypes.DATE,
            allowNull:true
        },
        pass_update_user: {
            type: DataTypes.STRING(32),
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

export default Pass_Record;
