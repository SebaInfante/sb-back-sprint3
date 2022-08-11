import { DataTypes } from "sequelize";
import db from "../db/connectionResgisters";

const Company = db.define<any>(
    "app_company",
    { id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement:true,
        allowNull:false
        },
        name: {
        type: DataTypes.STRING(32),
        allowNull:false
        },
        rut: {
        type: DataTypes.STRING(16),
        allowNull:false
        },
        role: {
        type: DataTypes.STRING(3),
        allowNull:false
        },
        mandante: {
        type: DataTypes.INTEGER,
        allowNull:true
        },
        email: {
        type: DataTypes.STRING(64),
        allowNull:true
        },
        razon: {
        type: DataTypes.STRING(64),
        allowNull:true
        },
        contacto: {
        type: DataTypes.STRING(64),
        allowNull:true
        },
        fono: {
        type: DataTypes.STRING(16),
        allowNull:true
        },
        create_time: {
        type: DataTypes.DATE,
        defaultValue: new Date(),
        allowNull: false,
        },
        create_user: {
        type: DataTypes.STRING,
        allowNull:false
        },
        update_time: {
        type: DataTypes.DATE,
        allowNull:true
        },
        update_user: {
        type: DataTypes.STRING,
        allowNull:true
        },
        deleted_flag: {
        type: DataTypes.TINYINT,
        defaultValue: 0,
        allowNull: false,
        },
    },
    { 
        freezeTableName: true,
        createdAt: false,
        updatedAt: false,
    }
);

export default Company;

