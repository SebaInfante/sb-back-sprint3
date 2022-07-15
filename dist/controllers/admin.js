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
exports.getUser = exports.getUsers = exports.deleteEmploment = exports.deleteTurno = exports.deleteCompany = exports.deleteUser = exports.addDocument = exports.addEmployement = exports.getAllEmployment = exports.getTurnosCompany = exports.getAllTurnos = exports.addTurnoEfectivo = exports.getAllCompanyxMandante = exports.getAllCompanyMandante = exports.getAllMandante = exports.getEmployment = exports.getTurno = exports.getCompany = exports.getAllCompany = exports.addCompany = void 0;
const fecha_1 = require("../utils/fecha");
const Document_1 = __importDefault(require("../models/Document"));
const Employment_1 = __importDefault(require("../models/Employment"));
const user_1 = __importDefault(require("../models/user"));
const Company_1 = __importDefault(require("../models/Company"));
const Shift_Config_1 = __importDefault(require("../models/Shift_Config"));
const { Op, fn, sequelize, Sequelize } = require("sequelize");
const fecha = new Date();
const addCompany = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, rut, role, razon, contacto, mandante = null, email = null, fono = null, userAuth } = req.body;
        const newCompany = {
            contacto,
            razon,
            name,
            rut,
            role,
            mandante,
            email,
            fono,
            create_user: userAuth.name
        };
        const company = Company_1.default.build(newCompany);
        yield company.save();
        res.json(company);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
});
exports.addCompany = addCompany;
const getAllCompany = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const company = yield Company_1.default.findAll({ where: { deleted_flag: 0 } });
        res.json(company);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
});
exports.getAllCompany = getAllCompany;
const getCompany = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const company = yield Company_1.default.findOne({ where: { id } });
        res.json(company);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
});
exports.getCompany = getCompany;
const getTurno = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const shift = yield Shift_Config_1.default.findOne({ where: { id } });
        res.json(shift);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
});
exports.getTurno = getTurno;
const getEmployment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const employment = yield Employment_1.default.findOne({ where: { id } });
        const document = yield Document_1.default.findAll({ where: { employment_id: id } });
        res.json({ employment, document });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
});
exports.getEmployment = getEmployment;
const getAllMandante = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const company = yield Company_1.default.findAll({ where: { role: "USM" } });
        res.json(company);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
});
exports.getAllMandante = getAllMandante;
const getAllCompanyMandante = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mandante = req.params.id;
        const company = yield Company_1.default.findAll({ where: { [Op.and]: [{ role: "USC" }, { mandante }, { deleted_flag: 0 }] } });
        res.json(company);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
});
exports.getAllCompanyMandante = getAllCompanyMandante;
const getAllCompanyxMandante = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userAuth = req.body.userAuth;
        const company = yield Company_1.default.findAll({ where: { [Op.and]: [{ role: "USC" }, { mandante: userAuth.id }, { deleted_flag: 0 }] } });
        res.json(company);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
});
exports.getAllCompanyxMandante = getAllCompanyxMandante;
const addTurnoEfectivo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type, company, name, start_time, end_time, start_early, start_late, end_early, end_late, initial_date, final_date, remark = '', userAuth } = req.body;
        console.log("🚀 ~ file: admin.ts ~ line 84 ~ addTurnoEfectivo ~ type", type);
        const employer = yield Company_1.default.findOne({ where: { [Op.and]: [{ id: company }, { deleted_flag: 0 }] } });
        let tipo;
        if (type) {
            tipo = 'Diurno';
        }
        else {
            tipo = 'Nocturno';
        }
        const newShift = {
            group_id: employer.id,
            group_name: employer.name,
            shift_name: name,
            start_time,
            end_time,
            type: tipo,
            start_early,
            start_late,
            end_early,
            end_late,
            initial_date,
            final_date,
            remark,
            create_user: userAuth.name
        };
        const shift_config = Shift_Config_1.default.build(newShift);
        yield shift_config.save();
        res.json(shift_config);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
});
exports.addTurnoEfectivo = addTurnoEfectivo;
const getAllTurnos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const shift_config = yield Shift_Config_1.default.findAll({ where: { deleted_flag: 0 } });
        res.json(shift_config);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
});
exports.getAllTurnos = getAllTurnos;
const getTurnosCompany = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const shift_config = yield Shift_Config_1.default.findAll({ where: { [Op.and]: [{ group_id: id }, { deleted_flag: 0 }] } });
        res.json(shift_config);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
});
exports.getTurnosCompany = getTurnosCompany;
const getAllEmployment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const employment = yield Employment_1.default.findAll({ where: { deleted_flag: 0 } });
        const document = yield Document_1.default.findAll({ where: { deleted_flag: 0 } });
        let newOcupacion = [];
        employment.map(ocupacion => {
            let n_documento = 0;
            document.forEach((documento) => { if (documento.employment_id == ocupacion.id)
                n_documento++; });
            newOcupacion.push(Object.assign(Object.assign({}, ocupacion.dataValues), { n_documento }));
        });
        res.json(newOcupacion);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
});
exports.getAllEmployment = getAllEmployment;
// ************************************************************************************************************************
// !                                              CREAR UN NUEVA OCUPACION
// ************************************************************************************************************************
const addEmployement = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { mandante, employee, employment, userAuth } = req.body;
        console.log("🚀 ~ file: admin.ts ~ line 148 ~ addEmployement ~ employee", employee);
        // const employeeItem = await Company.findOne({ where: { id: employee } });
        const newEmployement = {
            mandante,
            employee: employee,
            name: employment,
            create_user: userAuth.name
        };
        console.log("🚀 ~ file: users.ts ~ line 137 ~ createEmployement ~ newEmployement", newEmployement);
        const employmentItem = Employment_1.default.build(newEmployement);
        yield employmentItem.save();
        res.json(employmentItem);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
});
exports.addEmployement = addEmployement;
// ************************************************************************************************************************
// !                                              CREAR UN NUEVO DOCUMENTO
// ************************************************************************************************************************
const addDocument = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id_employment, name, require, userAuth } = req.body;
        const newDocument = {
            employment_id: id_employment,
            name,
            require,
            create_user: userAuth.name
        };
        const DocumentM = Document_1.default.build(newDocument);
        yield DocumentM.save();
        res.json(DocumentM);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
});
exports.addDocument = addDocument;
// ************************************************************************************************************************
// !                                              ELIMINAR UN USUARIO
// ************************************************************************************************************************
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { userAuth } = req.body;
        const user = yield user_1.default.findByPk(id);
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }
        const data = {
            deleted_flag: 1,
            update_time: (0, fecha_1.formatDate)(fecha),
            update_user: userAuth.name
        };
        console.log("🚀 ~ file: admin.ts ~ line 212 ~ deleteUser ~ data", data);
        yield user.update(data); // Eliminación Logica   //await user.destroy(); Eliminación Fisica
        res.json(user);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
});
exports.deleteUser = deleteUser;
// ************************************************************************************************************************
// !                                              ELIMINAR UNA COMPAÑIA
// ************************************************************************************************************************
const deleteCompany = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { userAuth } = req.body;
        const company = yield Company_1.default.findByPk(id);
        if (!company) {
            return res.status(404).json({ msg: "Company not found" });
        }
        const data = {
            deleted_flag: 1,
            update_time: (0, fecha_1.formatDate)(fecha),
            update_user: userAuth.name
        };
        yield company.update(data); // Eliminación Logica   //await user.destroy(); Eliminación Fisica
        res.json(company);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
});
exports.deleteCompany = deleteCompany;
// ************************************************************************************************************************
// !                                              ELIMINAR UN TURNO
// ************************************************************************************************************************
const deleteTurno = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { userAuth } = req.body;
        const shift = yield Shift_Config_1.default.findByPk(id);
        if (!shift) {
            return res.status(404).json({ msg: "Shift not found" });
        }
        const data = {
            deleted_flag: 1,
            update_time: (0, fecha_1.formatDate)(fecha),
            update_user: userAuth.name
        };
        yield shift.update(data); // Eliminación Logica   //await user.destroy(); Eliminación Fisica
        res.json(shift);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
});
exports.deleteTurno = deleteTurno;
// ************************************************************************************************************************
// !                                              ELIMINAR UNA OCUPACION
// ************************************************************************************************************************
const deleteEmploment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { userAuth } = req.body;
        const employment = yield Employment_1.default.findByPk(id);
        if (!employment) {
            return res.status(404).json({ msg: "Shift not found" });
        }
        const data = {
            deleted_flag: 1,
            update_time: (0, fecha_1.formatDate)(fecha),
            update_user: userAuth.name
        };
        yield employment.update(data); // Eliminación Logica   //await user.destroy(); Eliminación Fisica
        res.json(employment);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
});
exports.deleteEmploment = deleteEmploment;
// ************************************************************************************************************************
// !                                              VER TODOS LOS USUARIOS
// ************************************************************************************************************************
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield user_1.default.findAll({ where: { deleted_flag: 0 } });
        res.json(users);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
});
exports.getUsers = getUsers;
// ************************************************************************************************************************
// !                                              VER SOLO UN USUARIO
// ************************************************************************************************************************
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const user = yield user_1.default.findByPk(id);
        user
            ? res.json(user)
            : res.status(404).json({ msg: `User with id ${id} not found` });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
});
exports.getUser = getUser;
//# sourceMappingURL=admin.js.map