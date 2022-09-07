"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUser = exports.createUser = exports.getemploxmandanteAdmin = exports.getUserEmpleadoPorMandanteYAdmin = exports.getUserEmpleado = exports.getUserMandante = void 0;
const bcrypt_1 = require("../lib/bcrypt");
const fecha_1 = require("../utils/fecha");
const user_1 = __importDefault(require("../models/user"));
const Company_1 = __importDefault(require("../models/Company"));
const { Op } = require("sequelize");
const fecha = new Date();
// ************************************************************************************************************************
// !                                              VER USUARIO MANDANTE
// ************************************************************************************************************************
const getUserMandante = async (req, res) => {
    try {
        const users = await Company_1.default.findAll({ where: { role: "USM" } });
        res.json(users);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
};
exports.getUserMandante = getUserMandante;
// ************************************************************************************************************************
// !                                              VER USUARIO EMPLEADO
// ************************************************************************************************************************
const getUserEmpleado = async (req, res) => {
    try {
        const users = await Company_1.default.findAll({ where: { role: "USC" } });
        res.json(users);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
};
exports.getUserEmpleado = getUserEmpleado;
// ************************************************************************************************************************
// !                                              VER USUARIO EMPLEADO POR MANDANTE
// ************************************************************************************************************************
const getUserEmpleadoPorMandanteYAdmin = async (req, res) => {
    try {
        const userAuth = req.body.userAuth;
        let users;
        if (userAuth.role === "USM") {
            users = await user_1.default.findAll({ where: { role: "USC", employee: userAuth.id } });
        }
        else {
            users = await user_1.default.findAll({ where: { role: "USC" } });
        }
        res.json(users);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
};
exports.getUserEmpleadoPorMandanteYAdmin = getUserEmpleadoPorMandanteYAdmin;
// ************************************************************************************************************************
// !                                              VER USUARIO EMPLEADO POR MANDANTE
// ************************************************************************************************************************
const getemploxmandanteAdmin = async (req, res) => {
    try {
        const mandante = req.body.mandante;
        const users = await user_1.default.findAll({ where: { role: "USC", employee: mandante } });
        res.json(users);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
};
exports.getemploxmandanteAdmin = getemploxmandanteAdmin;
// ************************************************************************************************************************
// !                                              CREAR UN NUEVO USUARIO
// ************************************************************************************************************************
const createUser = async (req, res) => {
    try {
        const { name, email, password, role, employee = null, userAuth } = req.body;
        const existsEmail = await user_1.default.findOne({ where: { [Op.and]: [{ email }, { deleted_flag: 0 }] } }); //Buscar si existe un email
        if (existsEmail) {
            return res.status(401).json({ msg: "Email already used" });
        }
        const hashPassword = await (0, bcrypt_1.encriptar)(password);
        const newUser = {
            name,
            email,
            password: hashPassword,
            role,
            employee,
            create_user: userAuth.name
        };
        const user = user_1.default.build(newUser);
        await user.save();
        res.json(user);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
};
exports.createUser = createUser;
// ************************************************************************************************************************
// !                                              ACTUALIZAR UN USUARIO
// ************************************************************************************************************************
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { email, userAuth } = req.body;
        const user = await user_1.default.findByPk(id);
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }
        if (email) {
            const existsEmail = await user_1.default.findOne({ where: { email } });
            if (existsEmail) {
                return res.status(400).json({ msg: "Email already used" });
            }
        }
        const data = {
            email,
            update_time: (0, fecha_1.formatDate)(fecha),
            update_user: userAuth.name
        };
        await user.update(data);
        res.json(user);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
};
exports.updateUser = updateUser;
//# sourceMappingURL=users.js.map