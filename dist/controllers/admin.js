"use strict";
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
const addCompany = async (req, res) => {
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
        await company.save();
        res.json(company);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
};
exports.addCompany = addCompany;
// ************************************************************************************************************************
// !                                              OBTENGO TODAS LAS COMPAÑIAS
// ************************************************************************************************************************
const getAllCompany = async (req, res) => {
    try {
        const company = await Company_1.default.findAll({ where: { deleted_flag: 0 } });
        res.json(company);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
};
exports.getAllCompany = getAllCompany;
// ************************************************************************************************************************
// !                                              OBTENGO UNA COMPAÑIA POR UN ID DE EMPRESA
// ************************************************************************************************************************
const getCompany = async (req, res) => {
    try {
        const id = req.params.id;
        const company = await Company_1.default.findOne({ where: { id } });
        res.json(company);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
};
exports.getCompany = getCompany;
// ************************************************************************************************************************
// !                                              OBTENGO LOS TURNOS POR UN ID DE EMPRESA
// ************************************************************************************************************************
const getTurno = async (req, res) => {
    try {
        const id = req.params.id;
        const shift = await Shift_Config_1.default.findOne({ where: { id } });
        res.json(shift);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
};
exports.getTurno = getTurno;
// ************************************************************************************************************************
// !                                              OBTENGO UNA OCUPACION POR UN ID DE EMPRESA
// ************************************************************************************************************************
const getEmployment = async (req, res) => {
    try {
        const id = req.params.id;
        const employment = await Employment_1.default.findOne({ where: { id } });
        const document = await Document_1.default.findAll({ where: { employment_id: id } });
        res.json({ employment, document });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
};
exports.getEmployment = getEmployment;
// ************************************************************************************************************************
// !                                              OBTENGO TODOS LOS MANDANTES
// ************************************************************************************************************************
const getAllMandante = async (req, res) => {
    try {
        const company = await Company_1.default.findAll({ where: { role: "USM" } });
        res.json(company);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
};
exports.getAllMandante = getAllMandante;
// ************************************************************************************************************************
// !                                              OBTENGO TODAS LAS COMPAÑIAS POR UN MANDANTE
// ************************************************************************************************************************
const getAllCompanyMandante = async (req, res) => {
    try {
        const mandante = req.params.id;
        const company = await Company_1.default.findAll({ where: { [Op.and]: [{ role: "USC" }, { mandante }, { deleted_flag: 0 }] } });
        res.json(company);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
};
exports.getAllCompanyMandante = getAllCompanyMandante;
// ************************************************************************************************************************
// !                                              OBTENGO TODAS LAS COMPAÑIAS POR UN MANDANTE
// ************************************************************************************************************************
const getAllCompanyxMandante = async (req, res) => {
    try {
        const userAuth = req.body.userAuth;
        const company = await Company_1.default.findAll({ where: { [Op.and]: [{ role: "USC" }, { mandante: userAuth.id }, { deleted_flag: 0 }] } });
        res.json(company);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
};
exports.getAllCompanyxMandante = getAllCompanyxMandante;
// ************************************************************************************************************************
// !                                              AGREGO UN NUEVO TURNO EFECTIVO
// ************************************************************************************************************************
const addTurnoEfectivo = async (req, res) => {
    try {
        const { type, lunes, martes, miercoles, jueves, viernes, sabado, domingo, company, name, start_time, end_time, start_early, start_late, end_early, end_late, initial_date, final_date, remark = '', userAuth } = req.body;
        const employer = await Company_1.default.findOne({ where: { [Op.and]: [{ id: company }, { deleted_flag: 0 }] } });
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
        const shift_config = Shift_Config_1.default.build(newShift);
        await shift_config.save();
        res.json(shift_config);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
};
exports.addTurnoEfectivo = addTurnoEfectivo;
// ************************************************************************************************************************
// !                                              OBTENGO TODO LOS TURNOS
// ************************************************************************************************************************
const getAllTurnos = async (req, res) => {
    try {
        const shift_config = await Shift_Config_1.default.findAll({ where: { deleted_flag: 0 } });
        res.json(shift_config);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
};
exports.getAllTurnos = getAllTurnos;
// ************************************************************************************************************************
// !                                              OBTENGO LOS TURNOS DE UNA COMPAÑIA USANDO SU ID
// ************************************************************************************************************************
const getTurnosCompany = async (req, res) => {
    try {
        const id = req.params.id;
        const shift_config = await Shift_Config_1.default.findAll({ where: { [Op.and]: [{ group_id: id }, { deleted_flag: 0 }] } });
        res.json(shift_config);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
};
exports.getTurnosCompany = getTurnosCompany;
// ************************************************************************************************************************
// !                                              OBTENGO TODAS LAS OCUPACIONES 
// ************************************************************************************************************************
const getAllEmployment = async (req, res) => {
    try {
        const employment = await Employment_1.default.findAll({ where: { deleted_flag: 0 } });
        const document = await Document_1.default.findAll({ where: { deleted_flag: 0 } });
        let newOcupacion = [];
        employment.map(ocupacion => {
            let n_documento = 0;
            document.forEach((documento) => { if (documento.employment_id == ocupacion.id)
                n_documento++; });
            newOcupacion.push({
                ...ocupacion.dataValues,
                n_documento
            });
        });
        res.json(newOcupacion);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
};
exports.getAllEmployment = getAllEmployment;
// ************************************************************************************************************************
// !                                              AGREGA UNA NUEVA OCUPACION
// ************************************************************************************************************************
const addEmployement = async (req, res) => {
    try {
        const { mandante, employee, employment, userAuth } = req.body;
        const newEmployement = {
            mandante,
            employee: employee,
            name: employment,
            create_user: userAuth.name
        };
        const employmentItem = Employment_1.default.build(newEmployement);
        await employmentItem.save();
        res.json(employmentItem);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
};
exports.addEmployement = addEmployement;
// ************************************************************************************************************************
// !                                              AGREGA UN NUEVO DOCUMENTO
// ************************************************************************************************************************
const addDocument = async (req, res) => {
    try {
        const { id_employment, name, require, userAuth } = req.body;
        const newDocument = {
            employment_id: id_employment,
            name,
            require,
            create_user: userAuth.name
        };
        const documentItem = Document_1.default.build(newDocument);
        await documentItem.save();
        res.json(documentItem);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
};
exports.addDocument = addDocument;
// ************************************************************************************************************************
// !                                              ELIMINAR UN USUARIO
// ************************************************************************************************************************
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { userAuth } = req.body;
        const user = await user_1.default.findByPk(id);
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }
        const data = {
            deleted_flag: 1,
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
exports.deleteUser = deleteUser;
// ************************************************************************************************************************
// !                                              ELIMINAR UNA COMPAÑIA
// ************************************************************************************************************************
const deleteCompany = async (req, res) => {
    try {
        const { id } = req.params;
        const { userAuth } = req.body;
        const company = await Company_1.default.findByPk(id);
        if (!company) {
            return res.status(404).json({ msg: "Company not found" });
        }
        const data = {
            deleted_flag: 1,
            update_time: (0, fecha_1.formatDate)(fecha),
            update_user: userAuth.name
        };
        await company.update(data);
        res.json(company);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
};
exports.deleteCompany = deleteCompany;
// ************************************************************************************************************************
// !                                              ELIMINAR UN TURNO
// ************************************************************************************************************************
const deleteTurno = async (req, res) => {
    try {
        const { id } = req.params;
        const { userAuth } = req.body;
        const shift = await Shift_Config_1.default.findByPk(id);
        if (!shift) {
            return res.status(404).json({ msg: "Shift not found" });
        }
        const data = {
            deleted_flag: 1,
            update_time: (0, fecha_1.formatDate)(fecha),
            update_user: userAuth.name
        };
        await shift.update(data);
        res.json(shift);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
};
exports.deleteTurno = deleteTurno;
// ************************************************************************************************************************
// !                                              ELIMINAR UNA OCUPACION
// ************************************************************************************************************************
const deleteEmploment = async (req, res) => {
    try {
        const { id } = req.params;
        const { userAuth } = req.body;
        const employment = await Employment_1.default.findByPk(id);
        if (!employment) {
            return res.status(404).json({ msg: "Shift not found" });
        }
        const data = {
            deleted_flag: 1,
            update_time: (0, fecha_1.formatDate)(fecha),
            update_user: userAuth.name
        };
        await employment.update(data);
        res.json(employment);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
};
exports.deleteEmploment = deleteEmploment;
// ************************************************************************************************************************
// !                                              OBTENGO TODOS LOS USUARIOS
// ************************************************************************************************************************
const getUsers = async (req, res) => {
    try {
        const users = await user_1.default.findAll({ where: { deleted_flag: 0 } });
        res.json(users);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
};
exports.getUsers = getUsers;
// ************************************************************************************************************************
// !                                              OBTENGO SOLO UN USUARIO USANDO UN ID
// ************************************************************************************************************************
const getUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await user_1.default.findByPk(id);
        user
            ? res.json(user)
            : res.status(404).json({ msg: `User with id ${id} not found` });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
};
exports.getUser = getUser;
//# sourceMappingURL=admin.js.map