"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.asistenciaDiarias = exports.entradasSalidasDiarias = exports.turnosDash = exports.pasadasDash = void 0;
const now = new Date();
const { Op, QueryTypes } = require("sequelize");
const connectionResgisters_1 = __importDefault(require("../db/connectionResgisters"));
const fecha_1 = require("../utils/fecha");
// ************************************************************************************************************************
// !                                                Pasadas Dashboard
// ************************************************************************************************************************
const pasadasDash = async (req, res) => {
    try {
        const userAuth = req.body.userAuth;
        let employee;
        let temp = req.body.temp || "";
        let turno = req.body.turno || "";
        let contratista = req.body.contratista || "";
        if (contratista == "all") {
            contratista = "";
        }
        if (turno == "all") {
            turno = "";
        }
        if (temp == "all") {
            temp = "";
        }
        if (userAuth.role === "USC") {
            employee = userAuth.name;
        }
        else {
            !contratista ? (employee = "") : (employee = contratista);
        }
        const fecha = new Date();
        fecha.setHours(fecha.getHours() - 4);
        console.log("🚀 ~ file: records.ts ~ line 43 ~ pasadasDash ~ fecha", fecha);
        const diaNombre = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
        const nombreEmpresas = await connectionResgisters_1.default.query(`select group_name AS empresa from app_pass_records where  deleted_flag = 0 group by group_name`, { type: QueryTypes.SELECT });
        const menos0 = (0, fecha_1.restarDias)(fecha, 0).split("T", 1).toString();
        const nombre0 = diaNombre[fecha.getDay()];
        const menos1 = (0, fecha_1.restarDias)(fecha, 1).split("T", 1).toString();
        const nombre1 = diaNombre[fecha.getDay()];
        const menos2 = (0, fecha_1.restarDias)(fecha, 1).split("T", 1).toString();
        const nombre2 = diaNombre[fecha.getDay()];
        const menos3 = (0, fecha_1.restarDias)(fecha, 1).split("T", 1).toString();
        const nombre3 = diaNombre[fecha.getDay()];
        const menos4 = (0, fecha_1.restarDias)(fecha, 1).split("T", 1).toString();
        const nombre4 = diaNombre[fecha.getDay()];
        const menos5 = (0, fecha_1.restarDias)(fecha, 1).split("T", 1).toString();
        const nombre5 = diaNombre[fecha.getDay()];
        const menos6 = (0, fecha_1.restarDias)(fecha, 1).split("T", 1).toString();
        const nombre6 = diaNombre[fecha.getDay()];
        const dias = [menos0, menos1, menos2, menos3, menos4, menos5, menos6];
        const nombre = [nombre0, nombre1, nombre2, nombre3, nombre4, nombre5, nombre6];
        const dia0 = await connectionResgisters_1.default.query(`select count(distinct person_no) AS asistencia, group_name AS empresa from app_pass_records where pass_create_time like '%${menos0}%' group by group_name`, { type: QueryTypes.SELECT });
        const dia1 = await connectionResgisters_1.default.query(`select count(distinct person_no) AS asistencia, group_name AS empresa from app_pass_records where pass_create_time like '%${menos1}%' group by group_name`, { type: QueryTypes.SELECT });
        const dia2 = await connectionResgisters_1.default.query(`select count(distinct person_no) AS asistencia, group_name AS empresa from app_pass_records where pass_create_time like '%${menos2}%' group by group_name`, { type: QueryTypes.SELECT });
        const dia3 = await connectionResgisters_1.default.query(`select count(distinct person_no) AS asistencia, group_name AS empresa from app_pass_records where pass_create_time like '%${menos3}%' group by group_name`, { type: QueryTypes.SELECT });
        const dia4 = await connectionResgisters_1.default.query(`select count(distinct person_no) AS asistencia, group_name AS empresa from app_pass_records where pass_create_time like '%${menos4}%' group by group_name`, { type: QueryTypes.SELECT });
        const dia5 = await connectionResgisters_1.default.query(`select count(distinct person_no) AS asistencia, group_name AS empresa from app_pass_records where pass_create_time like '%${menos5}%' group by group_name`, { type: QueryTypes.SELECT });
        const dia6 = await connectionResgisters_1.default.query(`select count(distinct person_no) AS asistencia, group_name AS empresa from app_pass_records where pass_create_time like '%${menos6}%' group by group_name`, { type: QueryTypes.SELECT });
        const Dashboard = { dias, nombreEmpresas, nombre, dia0, dia1, dia2, dia3, dia4, dia5, dia6 };
        return res.status(200).json(Dashboard);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ msg: "Contact the administrator" });
    }
};
exports.pasadasDash = pasadasDash;
// ************************************************************************************************************************
// !                                                Turnos Dashboard
// ************************************************************************************************************************
const turnosDash = async (req, res) => {
    try {
        const userAuth = req.body.userAuth;
        let employee;
        let contratista = req.body.contratista || ""; //TODO aqui selecciona al contratista
        console.log("🚀 ~ file: dashboard.ts ~ line 86 ~ turnosDash ~ contratista", req.body);
        if (contratista == "all") {
            contratista = "";
        }
        if (userAuth.role === "USC") {
            employee = userAuth.name;
        }
        else {
            !contratista ? (employee = "") : (employee = contratista);
        }
        // *****************************
        const fecha = new Date();
        const GMT = process.env.GMT;
        fecha.setHours(fecha.getHours() - GMT);
        const diaNombre = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
        const nombreTurnos = await connectionResgisters_1.default.query(`select calculated_shift AS turno from app_pass_records where group_name like '%${employee}%' AND deleted_flag = 0 group by calculated_shift`, { type: QueryTypes.SELECT });
        const nombreEmpresas = await connectionResgisters_1.default.query(`select group_name AS empresa from app_pass_records where deleted_flag = 0 group by group_name`, { type: QueryTypes.SELECT });
        const menos0 = (0, fecha_1.restarDias)(fecha, 0).split("T", 1).toString();
        const nombre0 = diaNombre[fecha.getDay()];
        const menos1 = (0, fecha_1.restarDias)(fecha, 1).split("T", 1).toString();
        const nombre1 = diaNombre[fecha.getDay()];
        const menos2 = (0, fecha_1.restarDias)(fecha, 1).split("T", 1).toString();
        const nombre2 = diaNombre[fecha.getDay()];
        const menos3 = (0, fecha_1.restarDias)(fecha, 1).split("T", 1).toString();
        const nombre3 = diaNombre[fecha.getDay()];
        const menos4 = (0, fecha_1.restarDias)(fecha, 1).split("T", 1).toString();
        const nombre4 = diaNombre[fecha.getDay()];
        const menos5 = (0, fecha_1.restarDias)(fecha, 1).split("T", 1).toString();
        const nombre5 = diaNombre[fecha.getDay()];
        const menos6 = (0, fecha_1.restarDias)(fecha, 1).split("T", 1).toString();
        const nombre6 = diaNombre[fecha.getDay()];
        const dias = [menos0, menos1, menos2, menos3, menos4, menos5, menos6];
        const nombre = [nombre0, nombre1, nombre2, nombre3, nombre4, nombre5, nombre6];
        const dia0 = await connectionResgisters_1.default.query(`select COUNT(distinct person_no) AS asistencia, calculated_shift AS turno from app_pass_records where group_name like '%${employee}%' AND pass_create_time like '%${menos0}%' group by calculated_shift`, { type: QueryTypes.SELECT });
        const dia1 = await connectionResgisters_1.default.query(`select COUNT(distinct person_no) AS asistencia, calculated_shift AS turno from app_pass_records where group_name like '%${employee}%' AND pass_create_time like '%${menos1}%' group by calculated_shift`, { type: QueryTypes.SELECT });
        const dia2 = await connectionResgisters_1.default.query(`select COUNT(distinct person_no) AS asistencia, calculated_shift AS turno from app_pass_records where group_name like '%${employee}%' AND pass_create_time like '%${menos2}%' group by calculated_shift`, { type: QueryTypes.SELECT });
        const dia3 = await connectionResgisters_1.default.query(`select COUNT(distinct person_no) AS asistencia, calculated_shift AS turno from app_pass_records where group_name like '%${employee}%' AND pass_create_time like '%${menos3}%' group by calculated_shift`, { type: QueryTypes.SELECT });
        const dia4 = await connectionResgisters_1.default.query(`select COUNT(distinct person_no) AS asistencia, calculated_shift AS turno from app_pass_records where group_name like '%${employee}%' AND pass_create_time like '%${menos4}%' group by calculated_shift`, { type: QueryTypes.SELECT });
        const dia5 = await connectionResgisters_1.default.query(`select COUNT(distinct person_no) AS asistencia, calculated_shift AS turno from app_pass_records where group_name like '%${employee}%' AND pass_create_time like '%${menos5}%' group by calculated_shift`, { type: QueryTypes.SELECT });
        const dia6 = await connectionResgisters_1.default.query(`select COUNT(distinct person_no) AS asistencia, calculated_shift AS turno from app_pass_records where group_name like '%${employee}%' AND pass_create_time like '%${menos6}%' group by calculated_shift`, { type: QueryTypes.SELECT });
        const Dashboard = { dias, nombre, nombreTurnos, nombreEmpresas, dia0, dia1, dia2, dia3, dia4, dia5, dia6 };
        return res.status(200).json(Dashboard);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ msg: "Contact the administrator" });
    }
};
exports.turnosDash = turnosDash;
// ************************************************************************************************************************
// !                                                Turnos Dashboard
// ************************************************************************************************************************
const entradasSalidasDiarias = async (req, res) => {
    const userAuth = req.body.userAuth;
    let employee = '';
    if (userAuth.role === "USC")
        employee = userAuth.name;
    try {
        const now = new Date();
        const GMT = process.env.GMT;
        now.setHours(now.getHours() - GMT);
        const fecha = now.toISOString().split("T", 1).toString();
        console.log("🚀 ~ file: dashboard.ts ~ line 86 ~ entradasSalidasDiarias ~ fecha", fecha);
        const entradas = await connectionResgisters_1.default.query(`SELECT COUNT(id) AS entradas FROM app_pass_records WHERE pass_direction = 1 AND pass_create_time like '%${fecha}%' AND group_name like '%${employee}%'`, { type: QueryTypes.SELECT });
        const salidas = await connectionResgisters_1.default.query(`SELECT COUNT(id) AS salidas FROM app_pass_records WHERE pass_direction = 2 AND pass_create_time like '%${fecha}%' AND group_name like '%${employee}%'`, { type: QueryTypes.SELECT });
        return res.status(200).json({ entradas, salidas });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ msg: "Contact the administrator" });
    }
};
exports.entradasSalidasDiarias = entradasSalidasDiarias;
const asistenciaDiarias = async (req, res) => {
    const userAuth = req.body.userAuth;
    let employee = '';
    if (userAuth.role === "USC")
        employee = userAuth.name;
    try {
        const now = new Date();
        const GMT = process.env.GMT;
        now.setHours(now.getHours() - GMT);
        const fecha = now.toISOString().split("T", 1).toString();
        const asistencia = await connectionResgisters_1.default.query(`select count(distinct person_no) AS asistencia from app_pass_records where pass_create_time like '%${fecha}%' AND group_name like '%${employee}%'`, { type: QueryTypes.SELECT });
        return res.status(200).json(asistencia);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ msg: "Contact the administrator" });
    }
};
exports.asistenciaDiarias = asistenciaDiarias;
//# sourceMappingURL=dashboard.js.map