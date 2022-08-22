"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.filtrarAsistencia = exports.asistencia = void 0;
const { Op, QueryTypes } = require("sequelize");
const connectionResgisters_1 = __importDefault(require("../db/connectionResgisters"));
const s3_1 = require("../lib/s3");
const fecha_1 = require("../utils/fecha");
const asistencia = async (req, res) => {
    const userAuth = req.body.userAuth;
    let employee = '';
    if (userAuth.role === "USC")
        employee = userAuth.name;
    try {
        const asistencia = await connectionResgisters_1.default.query(`
            SELECT MIN(app_pass_records.pass_time) AS time, CAST(pass_create_time AS DATE) AS fecha, person_resource_url, person_name, person_no , group_name, calculated_shift
            FROM app_pass_records
            WHERE pass_direction = 1 AND person_no <> '' AND group_name like '%${employee}%'
            GROUP BY person_no,person_resource_url, person_name, person_no , group_name, calculated_shift, CAST(pass_create_time AS DATE)
            ORDER BY  CAST(pass_create_time AS DATE) DESC
        `, { type: QueryTypes.SELECT });
        let i = 0;
        asistencia.forEach((persona) => {
            persona.id = i;
            persona.group_name = capitalizar(persona.group_name);
            function capitalizar(str) {
                return str.replace(/\w\S*/g, function (txt) {
                    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                });
            }
            persona.URL = (0, s3_1.getUrlS3)(persona.group_name, persona.person_resource_url, persona.person_no);
            i++;
        });
        return res.status(200).json(asistencia);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ msg: "Contact the administrator" });
    }
};
exports.asistencia = asistencia;
const filtrarAsistencia = async (req, res) => {
    const userAuth = req.body.userAuth;
    let employee = '';
    const now = new Date();
    const name = req.body.name || "";
    const rut = req.body.rut || "";
    const intervalo = req.body.intervalo || 365;
    const initDate = req.body.fecha || (0, fecha_1.formatDate)(now);
    const fecha = new Date(initDate);
    const fechaActual = (0, fecha_1.sumarDias)(fecha, 1).split("T", 1).toString();
    const fechaAnterior = (0, fecha_1.restarDias)(fecha, intervalo).split("T", 1).toString();
    if (userAuth.role === "USC")
        employee = userAuth.name;
    try {
        const asistencia = await connectionResgisters_1.default.query(`
            SELECT MIN(app_pass_records.pass_time) AS time, CAST(pass_create_time AS DATE) AS fecha, person_resource_url, person_name, person_no , group_name, calculated_shift
            FROM app_pass_records
            WHERE pass_direction = 1 AND person_no like '%${rut}%' AND person_name like '%${name}%' AND group_name like '%${employee}%' AND  pass_create_time BETWEEN '${fechaAnterior}' AND '${fechaActual}'
            GROUP BY person_no,person_resource_url, person_name, person_no , group_name, calculated_shift, CAST(pass_create_time AS DATE)
            ORDER BY  CAST(pass_create_time AS DATE) DESC
        `, { type: QueryTypes.SELECT });
        let i = 0;
        asistencia.forEach((persona) => {
            persona.id = i;
            persona.group_name = capitalizar(persona.group_name);
            function capitalizar(str) {
                return str.replace(/\w\S*/g, function (txt) {
                    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                });
            }
            persona.URL = (0, s3_1.getUrlS3)(persona.group_name, persona.person_resource_url, persona.person_no);
            i++;
        });
        return res.status(200).json(asistencia);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ msg: "Contact the administrator" });
    }
};
exports.filtrarAsistencia = filtrarAsistencia;
//# sourceMappingURL=reportes.js.map