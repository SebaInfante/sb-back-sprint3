"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculoHora = exports.filtrarNomina = exports.filtrarAsistencia = exports.asistencia = void 0;
const { Op, QueryTypes } = require("sequelize");
const connectionResgisters_1 = __importDefault(require("../db/connectionResgisters"));
const s3_1 = require("../lib/s3");
const Company_1 = __importDefault(require("../models/Company"));
const Person_1 = __importDefault(require("../models/Person"));
const fecha_1 = require("../utils/fecha");
const asistencia = async (req, res) => {
    const userAuth = req.body.userAuth;
    let contratista;
    let employee = '';
    if (userAuth.role === "USC") {
        let employment = await Company_1.default.findAll({ where: { [Op.and]: [{ id: userAuth.employee }, { deleted_flag: 0 }] } });
        employee = employment[0]?.name;
    }
    else {
        !contratista ? (employee = "") : (employee = contratista);
    }
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
    let contratista;
    if (userAuth.role === "USC") {
        let employment = await Company_1.default.findAll({ where: { [Op.and]: [{ id: userAuth.employee }, { deleted_flag: 0 }] } });
        employee = employment[0]?.name;
    }
    else {
        !contratista ? (employee = "") : (employee = contratista);
    }
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
            persona.fecha = persona.fecha.replace('-', '/');
            persona.fecha = persona.fecha.replace('-', '/');
            let dateUp = new Date(persona.fecha);
            persona.fecha = (0, fecha_1.sumarDias)(dateUp, 1).split("T", 1).toString();
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
        console.table(asistencia);
        return res.status(200).json(asistencia);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ msg: "Contact the administrator" });
    }
};
exports.filtrarAsistencia = filtrarAsistencia;
const filtrarNomina = async (req, res) => {
    try {
        const userAuth = req.body.userAuth;
        const name = req.body.name || "";
        const rut = req.body.rut || "";
        // const ocupacion = req.body.ocupacion || "";
        const now = new Date();
        const intervalo = req.body.intervalo || 365;
        const initDate = req.body.fecha || (0, fecha_1.formatDate)(now);
        const fecha = new Date(initDate);
        const fechaActual = (0, fecha_1.sumarDias)(fecha, 1).split("T", 1).toString();
        const fechaAnterior = (0, fecha_1.restarDias)(fecha, intervalo).split("T", 1).toString();
        let contratista = req.body.contratista || "";
        let employee;
        if (contratista == "all") {
            contratista = "";
        }
        if (userAuth.role === "USC") {
            let employment = await Company_1.default.findAll({ where: { [Op.and]: [{ id: userAuth.employee }, { deleted_flag: 0 }] } });
            employee = employment[0]?.name;
        }
        else {
            !contratista ? (employee = "") : (employee = contratista);
        }
        const Persons = await Person_1.default.findAll({
            attributes: [
                'id',
                'email',
                'person_name',
                ['update_time', 'create_time'],
                'status',
                ['avatar_url', 'avatar'],
                ['person_no', 'id_card'],
                ['employee_name', 'empresa'],
                ['employment_name', 'ocupacion']
            ],
            where: {
                [Op.and]: [
                    { person_name: { [Op.substring]: name } },
                    { person_no: { [Op.substring]: rut } },
                    { employee_name: { [Op.substring]: employee } },
                    { deleted_flag: 0 },
                    { update_time: { [Op.between]: [fechaAnterior, fechaActual] } }
                ],
            },
            order: [
                ['update_time', 'DESC']
            ],
            limit: 500
        });
        await Persons.map((Person) => {
            Person.dataValues.URL = (0, s3_1.getUrlS3)(Person.dataValues.empresa, Person.dataValues.avatar, Person.dataValues.id_card);
        });
        return res.json(Persons);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ msg: "Contact the administrator" });
    }
};
exports.filtrarNomina = filtrarNomina;
const calculoHora = async (req, res) => {
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
    let contratista;
    if (userAuth.role === "USC") {
        let employment = await Company_1.default.findAll({ where: { [Op.and]: [{ id: userAuth.employee }, { deleted_flag: 0 }] } });
        employee = employment[0]?.name;
    }
    else {
        !contratista ? (employee = "") : (employee = contratista);
    }
    try {
        const asistencia = await connectionResgisters_1.default.query(`
            SELECT MIN(app_pass_records.pass_time) AS entrada, MAX(app_pass_records.pass_time) AS salida, CAST(pass_create_time AS DATE) AS fecha, person_resource_url, person_name, person_no , group_name, calculated_shift
            FROM app_pass_records
            WHERE pass_direction = 1 AND person_no like '%${rut}%' AND person_name like '%${name}%' AND group_name like '%${employee}%' AND  pass_create_time BETWEEN '${fechaAnterior}' AND '${fechaActual}'
            GROUP BY person_no,person_resource_url, person_name, person_no , group_name, calculated_shift, CAST(pass_create_time AS DATE)
            ORDER BY  CAST(pass_create_time AS DATE) DESC
        `, { type: QueryTypes.SELECT });
        let i = 0;
        asistencia.forEach((persona) => {
            persona.fecha = persona.fecha.replace('-', '/');
            persona.fecha = persona.fecha.replace('-', '/');
            let dateUp = new Date(persona.fecha);
            persona.fecha = (0, fecha_1.sumarDias)(dateUp, 1).split("T", 1).toString();
            persona.id = i;
            persona.group_name = capitalizar(persona.group_name);
            let segundos = (persona.salida - persona.entrada) / 1000;
            let minutos = Math.trunc(segundos / 60);
            let segResto;
            let minResto;
            if (segundos % 60 < 10) {
                segResto = `0${segundos % 60}`;
            }
            else {
                segResto = segundos % 60;
            }
            if (minutos % 60 < 10) {
                minResto = `0${minutos % 60}`;
            }
            else {
                minResto = minutos % 60;
            }
            persona.calculo = `${Math.trunc(minutos / 60)}:${minResto}:${segResto}`;
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
exports.calculoHora = calculoHora;
// SELECT MIN(app_pass_records.pass_time) AS entrada, MAX(app_pass_records.pass_time) AS salida, CAST(pass_create_time AS DATE) AS fecha, person_resource_url, person_name, person_no , group_name, calculated_shift
// FROM app_pass_records
// WHERE pass_direction = 1 AND person_no like '%${rut}%' AND person_name like '%${name}%' AND group_name like '%${employee}%' AND  pass_create_time BETWEEN '${fechaAnterior}' AND '${fechaActual}'
// GROUP BY person_no,person_resource_url, person_name, person_no , group_name, calculated_shift, CAST(pass_create_time AS DATE)
// ORDER BY  CAST(pass_create_time AS DATE) DESC
//# sourceMappingURL=reportes.js.map