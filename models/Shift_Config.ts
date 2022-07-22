import { DataTypes } from "sequelize";
import db from "../db/connectionResgisters";

//Colcar las columnas de la bd que se actualizan en este caso el id no va porque es autoincrementable
const Shift_Config = db.define<any>(
    "app_shift_config",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        group_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        group_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        shift_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        start_time: {
            type: DataTypes.TIME,
            allowNull: false,
        },
        end_time: {
            type: DataTypes.TIME,
            allowNull: false,
        },
        start_early: {
            type: DataTypes.TIME,
            allowNull: false,
        },
        start_late: {
            type: DataTypes.TIME,
            allowNull: false,
        },
        end_early: {
            type: DataTypes.TIME,
            allowNull: false,
        },
        end_late: {
            type: DataTypes.TIME,
            allowNull: false,
        },
        initial_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        final_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        remark: {
            type: DataTypes.STRING,
            allowNull:true
        },
        type: {
            type: DataTypes.BOOLEAN,
            allowNull:true
        },
        lunes: {
            type: DataTypes.BOOLEAN,
            allowNull:true
        },
        martes: {
            type: DataTypes.BOOLEAN,
            allowNull:true
        },
        miercoles: {
            type: DataTypes.BOOLEAN,
            allowNull:true
        },
        jueves: {
            type: DataTypes.BOOLEAN,
            allowNull:true
        },
        viernes: {
            type: DataTypes.BOOLEAN,
            allowNull:true
        },
        sabado: {
            type: DataTypes.BOOLEAN,
            allowNull:true
        },
        domingo: {
            type: DataTypes.BOOLEAN,
            allowNull:true
        },
        create_time: {
            type: DataTypes.DATE,
            defaultValue: new Date(),
            allowNull: false,
        },
        create_user: {
            type: DataTypes.STRING,
            allowNull: false,
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

export default Shift_Config;
