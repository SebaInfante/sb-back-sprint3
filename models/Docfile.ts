import { DataTypes } from "sequelize";
import db from "../db/connectionResgisters";

//Colcar las columnas de la bd que se actualizan en este caso el id no va porque es autoincrementable
const Docfile = db.define<any>(
    "app_docfile",
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement:true
        },
        employment_id: {
            type: DataTypes.INTEGER,
            allowNull:false
        },
        person_no: {
            type: DataTypes.STRING(16),
            allowNull:false
        },
        document_name: {
            type: DataTypes.STRING(64),
            allowNull:false
        },
        document_id: {
            type: DataTypes.INTEGER,
            allowNull:false
        },
        docfile_url: {
            type: DataTypes.STRING(255),
            allowNull:false
        },
        docfile_alias: {
            type: DataTypes.STRING(128),
            allowNull:false
        },
        docfile_size: {
            type: DataTypes.SMALLINT,
            allowNull:false
        },
        docfile_suffix: {
            type: DataTypes.STRING(8),
            allowNull:false
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

export default Docfile;
