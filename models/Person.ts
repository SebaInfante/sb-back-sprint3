import { DataTypes } from "sequelize";
import db from "../db/connectionResgisters";

const Person = db.define<any>(
    "app_person",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement:true,
            allowNull:false
        },
        smart_id: {
            type: DataTypes.INTEGER,
            allowNull:true
        },
        person_no: {
            type: DataTypes.STRING(16),
            allowNull:false
        },
        person_name: {
            type: DataTypes.STRING(128),
            allowNull:false
        },
        gender: {
            type: DataTypes.TINYINT,
            allowNull:false
        },
        employee_name: {
            type: DataTypes.STRING(32),
            allowNull:false
        },
        employment_name: {
            type: DataTypes.STRING(64),
            allowNull:false,
            defaultValue: 'No seleccionado',
        },
        id_finger: {
            type: DataTypes.STRING,
            allowNull:true
        },
        id_qr: {
            type: DataTypes.STRING(255),
            allowNull:true
        },
        qr_url:{
            type: DataTypes.STRING,
            allowNull:false
        },
        email: {
            type: DataTypes.STRING(128),
            allowNull:true
        },
        phone: {
            type: DataTypes.STRING(16),
            allowNull:true
        },
        avatar_url: {
            type: DataTypes.STRING(255),
            allowNull:false
        },
        avatar_alias: {
            type: DataTypes.STRING(128),
            allowNull:false
        },
        avatar_size: {
            type: DataTypes.SMALLINT,
            allowNull:false
        },
        avatar_dimensions: {
            type: DataTypes.STRING(16),
            allowNull:false
        },
        avatar_suffix: {
            type: DataTypes.STRING(8),
            allowNull:false
        },
        status: {
            type: DataTypes.TINYINT,
            defaultValue: 1,
            allowNull:false
        },
        remark: {
            type: DataTypes.STRING(255),
            allowNull:true
        },
        create_time: {
            type: DataTypes.DATE,
            defaultValue: new Date(),
            allowNull:false
        },
        create_user: {
            type: DataTypes.STRING(32),
            allowNull:false
        },
        update_time: {
            type: DataTypes.DATE,
            allowNull:true
        },
        update_user: {
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

export default Person;
