"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUser = exports.createUser = exports.getemploxmandanteAdmin = exports.getUserEmpleadoPorMandanteYAdmin = exports.getUserEmpleado = exports.getUserMandante = void 0;
const bcrypt_1 = require("../lib/bcrypt");
const fecha_1 = require("../utils/fecha");
const user_1 = __importDefault(require("../models/user"));
const fecha = new Date();
// ************************************************************************************************************************
// !                                              VER USUARIO MANDANTE
// ************************************************************************************************************************
const getUserMandante = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield user_1.default.findAll({ where: { role: "USM" } });
        res.json(users);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
});
exports.getUserMandante = getUserMandante;
// ************************************************************************************************************************
// !                                              VER USUARIO EMPLEADO
// ************************************************************************************************************************
const getUserEmpleado = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield user_1.default.findAll({ where: { role: "USC" } });
        res.json(users);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
});
exports.getUserEmpleado = getUserEmpleado;
// ************************************************************************************************************************
// !                                              VER USUARIO EMPLEADO POR MANDANTE
// ************************************************************************************************************************
const getUserEmpleadoPorMandanteYAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userAuth = req.body.userAuth;
        let users;
        if (userAuth.role === "USM") {
            users = yield user_1.default.findAll({ where: { role: "USC", employee: userAuth.id } });
        }
        else {
            users = yield user_1.default.findAll({ where: { role: "USC" } });
        }
        res.json(users);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
});
exports.getUserEmpleadoPorMandanteYAdmin = getUserEmpleadoPorMandanteYAdmin;
// ************************************************************************************************************************
// !                                              VER USUARIO EMPLEADO POR MANDANTE
// ************************************************************************************************************************
const getemploxmandanteAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mandante = req.body.mandante;
        const users = yield user_1.default.findAll({ where: { role: "USC", employee: mandante } });
        res.json(users);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
});
exports.getemploxmandanteAdmin = getemploxmandanteAdmin;
// ************************************************************************************************************************
// !                                              CREAR UN NUEVO USUARIO
// ************************************************************************************************************************
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password, role, employee = null, userAuth } = req.body;
        const existsEmail = yield user_1.default.findOne({ where: { email } }); //Buscar si existe un email
        if (existsEmail) {
            return res.status(401).json({ msg: "Email already used" });
        }
        const hashPassword = yield (0, bcrypt_1.encriptar)(password);
        const newUser = {
            name,
            email,
            password: hashPassword,
            role,
            employee,
            create_user: userAuth.name
        };
        const user = user_1.default.build(newUser);
        yield user.save();
        res.json(user);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
});
exports.createUser = createUser;
// ************************************************************************************************************************
// !                                              ACTUALIZAR UN USUARIO
// ************************************************************************************************************************
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { email, userAuth } = req.body;
        const user = yield user_1.default.findByPk(id);
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }
        if (email) {
            const existsEmail = yield user_1.default.findOne({ where: { email } });
            if (existsEmail) {
                return res.status(400).json({ msg: "Email already used" });
            }
        }
        const data = {
            email,
            update_time: (0, fecha_1.formatDate)(fecha),
            update_user: userAuth.name
        };
        yield user.update(data);
        res.json(user);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
});
exports.updateUser = updateUser;
//# sourceMappingURL=users.js.map