import { DataTypes } from "sequelize";
import db from "../db/connectionResgisters";

const Employment = db.define<any>(
    "app_employment",
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement:true
        },
        mandante: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        employee: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING(64),
            allowNull: true,
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

export default Employment;
