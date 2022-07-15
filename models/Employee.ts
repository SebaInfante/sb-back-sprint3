import { DataTypes } from "sequelize";
import db from "../db/connectionResgisters";

const Employee = db.define<any>(
    "app_employee",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement:true,
            allowNull:false
        },
        person_no: {
            type: DataTypes.STRING(16),
            allowNull:false
        },
        employer: {
            type: DataTypes.INTEGER,
            allowNull:false
        },
        employment: {
            type: DataTypes.INTEGER,
            allowNull:false
        },
        expire_date: {
            type: DataTypes.DATE,
            allowNull:true
        },
        create_time: {
            type: DataTypes.DATE,
            defaultValue: new Date(),
            allowNull: false,
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

export default Employee;
