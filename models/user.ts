import { DataTypes } from "sequelize";
import db from "../db/connectionResgisters";

//Colcar las columnas de la bd que se actualizan en este caso el id no va porque es autoincrementable
const User = db.define<any>(
  "app_users",
  { id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement:true,
      allowNull:false
    },
    name: {
      type: DataTypes.STRING,
      allowNull:false
    },
    email: {
      type: DataTypes.STRING,
      allowNull:false
    },
    password: {
      type: DataTypes.STRING,
      allowNull:false
    },
    role: {
      type: DataTypes.STRING,
      allowNull:false
    },
    employee: {
      type: DataTypes.INTEGER,
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

export default User;

