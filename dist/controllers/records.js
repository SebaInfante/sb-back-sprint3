"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRecord = exports.deleteRecord = exports.downReport = exports.downloadReportRecords = exports.recordsToDay = void 0;
const Pass_Record_1 = __importDefault(require("../models/Pass_Record"));
const fecha_1 = require("../utils/fecha");
const xl = require("excel4node");
const uuid_1 = require("uuid");
const Person_1 = __importDefault(require("../models/Person"));
const s3_1 = require("../lib/s3");
const path_1 = __importDefault(require("path"));
const now = new Date();
const { Op, QueryTypes } = require("sequelize");
// ************************************************************************************************************************
// !                                                ULTIMAS 500 PASADAS / 2dias
// ************************************************************************************************************************
const recordsToDay = async (req, res) => {
    try {
        const userAuth = req.body.userAuth;
        const name = req.body.name || "";
        const rut = req.body.rut || "";
        const intervalo = req.body.intervalo || 365;
        const initDate = req.body.fecha || (0, fecha_1.formatDate)(now);
        const page = req.body.page || "";
        const fecha = new Date(initDate);
        const fechaActual = (0, fecha_1.sumarDias)(fecha, 1).split("T", 1).toString();
        const fechaAnterior = (0, fecha_1.restarDias)(fecha, intervalo).split("T", 1).toString();
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
        const Pass_Records = await Pass_Record_1.default.findAll({
            where: {
                [Op.and]: [
                    { deleted_flag: 0 },
                    { pass_direction: { [Op.substring]: turno } },
                    { pass_temperature_state: { [Op.substring]: temp } },
                    { person_name: { [Op.substring]: name } },
                    { person_no: { [Op.substring]: rut } },
                    { group_name: { [Op.substring]: employee } },
                    { pass_create_time: { [Op.between]: [fechaAnterior, fechaActual] } }
                ],
            },
            order: [
                ['pass_create_time', 'DESC']
            ],
            limit: 500
        });
        Pass_Records.map((pass) => {
            const urls = pass.dataValues.person_resource_url;
            if (urls)
                pass.dataValues.resource_url = (0, s3_1.getUrlS3)(pass.dataValues.group_name, urls, pass.dataValues.person_no);
            pass.dataValues.pass_img_url = (0, s3_1.getUrlS3PassRecord)(pass.dataValues.pass_img_url);
        });
        setTimeout(() => {
            return res.status(200).json(Pass_Records);
        }, 2000);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ msg: "Contact the administrator" });
    }
};
exports.recordsToDay = recordsToDay;
// ************************************************************************************************************************
// !                                                Genera reporte 10000 registros
// ************************************************************************************************************************
const downloadReportRecords = async (req, res) => {
    try {
        const userAuth = req.body.userAuth;
        const name = req.body.name || "";
        const rut = req.body.rut || "";
        const intervalo = req.body.intervalo || 365;
        const initDate = req.body.fecha || (0, fecha_1.formatDate)(now);
        const fecha = new Date(initDate);
        const fechaActual = (0, fecha_1.sumarDias)(fecha, 1).split("T", 1).toString();
        const fechaAnterior = (0, fecha_1.restarDias)(fecha, intervalo).split("T", 1).toString();
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
        const Pass_Records = await Pass_Record_1.default.findAll({
            where: {
                [Op.and]: [
                    { deleted_flag: 0 },
                    { pass_direction: { [Op.substring]: turno } },
                    { pass_temperature_state: { [Op.substring]: temp } },
                    { person_name: { [Op.substring]: name } },
                    { person_no: { [Op.substring]: rut } },
                    { group_name: { [Op.substring]: employee } },
                    { pass_create_time: { [Op.between]: [fechaAnterior, fechaActual] } }
                ],
            },
            order: [
                ['pass_create_time', 'DESC']
            ],
            limit: 10000
        });
        const wb = new xl.Workbook();
        const ws = wb.addWorksheet("Sheet 1");
        const style = wb.createStyle({
            font: {
                color: "#095B90",
                size: 12,
            },
            numberFormat: "$#,##0.00; ($#,##0.00); -",
        });
        ws.cell(1, 1).string("Tipo").style(style);
        ws.cell(1, 2).string("Pasada").style(style);
        ws.cell(1, 3).string("Fecha").style(style);
        ws.cell(1, 4).string("Hora").style(style);
        ws.cell(1, 5).string("Registro").style(style);
        ws.cell(1, 6).string("Temperatura").style(style);
        ws.cell(1, 7).string("Temp estado").style(style);
        ws.cell(1, 8).string("Dispositivo").style(style);
        ws.cell(1, 9).string("Rut").style(style);
        ws.cell(1, 10).string("Nombre").style(style);
        ws.cell(1, 11).string("Avatar").style(style);
        await Pass_Records?.forEach((row, index) => {
            ws.cell(index + 2, 1).string(row?.pass_type || "");
            ws.cell(index + 2, 2).number(row?.pass_direction);
            ws.cell(index + 2, 3).date(new Date(row?.pass_create_time));
            ws.cell(index + 2, 4).date(row?.pass_time || "");
            ws.cell(index + 2, 5).string(row?.pass_img_url || "");
            ws.cell(index + 2, 6).string(row?.pass_temperature || "");
            ws.cell(index + 2, 7).number(row?.pass_temperature_state || "");
            ws.cell(index + 2, 8).number(row?.pass_device_id || "");
            ws.cell(index + 2, 9).string(row?.person_no || "");
            ws.cell(index + 2, 10).string(row?.person_name || "");
            ws.cell(index + 2, 11).string(row?.person_resource_url || "");
        });
        const Filename = `${(0, uuid_1.v4)()}.xlsx`;
        const pathExcel = path_1.default.join(__dirname, "../..", "excel", Filename);
        await wb.write(pathExcel, function (err, stats) {
            if (err) {
                console.log(err);
            }
            else {
                function downloadFile() {
                    res.download(pathExcel);
                    return res.status(200).json({
                        Filename: Filename,
                        url: "http://localhost:8000/api/records/downreport",
                    });
                }
                downloadFile();
                return false;
            }
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
};
exports.downloadReportRecords = downloadReportRecords;
// ************************************************************************************************************************
// !                                                Descarga del reporte excel
// ************************************************************************************************************************
const downReport = async (req, res) => {
    try {
        let filename = req.params.resource_url;
        let url = path_1.default.join(__dirname, "../..", "excel", filename);
        res.status(200).download(url);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
};
exports.downReport = downReport;
// ************************************************************************************************************************
// !                                                Eliminar una pasada
// ************************************************************************************************************************
const deleteRecord = async (req, res) => {
    try {
        const id = req.params.id;
        const userAuth = req.body.userAuth;
        const data = {
            pass_update_time: (0, fecha_1.formatDate)(now),
            pass_update_user: userAuth.name,
            deleted_flag: 1
        };
        await Pass_Record_1.default.update(data, { where: { id } });
        return res.status(200).json({ msg: "Archivo Eliminado correctamente" });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
};
exports.deleteRecord = deleteRecord;
// ************************************************************************************************************************
// !                                                Actualizar una pasada
// ************************************************************************************************************************
const updateRecord = async (req, res) => {
    try {
        const id = req.params.id;
        const person = await Person_1.default.findOne({ where: { person_no: req.body.person_id } });
        console.log("🚀 ~ file: records.ts ~ line 232 ~ updateRecord ~ person", person);
        const data = {
            pass_direction: req.body.turno,
            person_no: person.person_no,
            person_name: person.person_name,
            person_resource_url: person.avatar_url,
            pass_update_time: (0, fecha_1.formatDate)(now),
            pass_update_user: req.body.userAuth.name,
        };
        await Pass_Record_1.default.update(data, { where: { id } });
        return res.status(200).json({ msg: "Archivo Actualizado correctamente" });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
};
exports.updateRecord = updateRecord;
//# sourceMappingURL=records.js.map