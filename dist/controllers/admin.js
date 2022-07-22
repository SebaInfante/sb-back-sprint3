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
const { Op } = require("sequelize");
const fecha = new Date();
// ************************************************************************************************************************
// !                                              AGREGAR UNA COMPAÑIA
// ************************************************************************************************************************
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
// ************************************************************************************************************************
// !                                              OBTENGO TODAS LAS COMPAÑIAS
// ************************************************************************************************************************
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
// ************************************************************************************************************************
// !                                              OBTENGO UNA COMPAÑIA POR UN ID DE EMPRESA
// ************************************************************************************************************************
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
// ************************************************************************************************************************
// !                                              OBTENGO LOS TURNOS POR UN ID DE EMPRESA
// ************************************************************************************************************************
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
// ************************************************************************************************************************
// !                                              OBTENGO UNA OCUPACION POR UN ID DE EMPRESA
// ************************************************************************************************************************
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
// ************************************************************************************************************************
// !                                              OBTENGO TODOS LOS MANDANTES
// ************************************************************************************************************************
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
// ************************************************************************************************************************
// !                                              OBTENGO TODAS LAS COMPAÑIAS POR UN MANDANTE
// ************************************************************************************************************************
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
// ************************************************************************************************************************
// !                                              OBTENGO TODAS LAS COMPAÑIAS POR UN MANDANTE
// ************************************************************************************************************************
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
// ************************************************************************************************************************
// !                                              AGREGO UN NUEVO TURNO EFECTIVO
// ************************************************************************************************************************
const addTurnoEfectivo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type, lunes, martes, miercoles, jueves, viernes, sabado, domingo, company, name, start_time, end_time, start_early, start_late, end_early, end_late, initial_date, final_date, remark = '', userAuth } = req.body;
        const employer = yield Company_1.default.findOne({ where: { [Op.and]: [{ id: company }, { deleted_flag: 0 }] } });
        let tipo;
        type ? tipo = 'Diurno' : tipo = 'Nocturno';
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
            lunes,
            martes,
            miercoles,
            jueves,
            viernes,
            sabado,
            domingo,
            create_user: userAuth.name
        };
        console.log("🚀 ~ file: admin.ts ~ line 179 ~ addTurnoEfectivo ~ newShift", newShift);
        // res.json(true);
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
// ************************************************************************************************************************
// !                                              OBTENGO TODO LOS TURNOS
// ************************************************************************************************************************
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
// ************************************************************************************************************************
// !                                              OBTENGO LOS TURNOS DE UNA COMPAÑIA USANDO SU ID
// ************************************************************************************************************************
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
// ************************************************************************************************************************
// !                                              OBTENGO TODAS LAS OCUPACIONES 
// ************************************************************************************************************************
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
// !                                              AGREGA UNA NUEVA OCUPACION
// ************************************************************************************************************************
const addEmployement = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { mandante, employee, employment, userAuth } = req.body;
        const newEmployement = {
            mandante,
            employee: employee,
            name: employment,
            create_user: userAuth.name
        };
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
// !                                              AGREGA UN NUEVO DOCUMENTO
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
        const documentItem = Document_1.default.build(newDocument);
        yield documentItem.save();
        res.json(documentItem);
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
        yield user.update(data);
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
        yield company.update(data);
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
        yield shift.update(data);
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
        yield employment.update(data);
        res.json(employment);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
});
exports.deleteEmploment = deleteEmploment;
// ************************************************************************************************************************
// !                                              OBTENGO TODOS LOS USUARIOS
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
// !                                              OBTENGO SOLO UN USUARIO USANDO UN ID
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