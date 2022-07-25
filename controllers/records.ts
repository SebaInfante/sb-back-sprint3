import { Response, Request } from "express";
import Pass_Record from "../models/Pass_Record";

import { restarDias, sumarDias, formatDate } from "../utils/fecha";

const xl = require("excel4node");
import path from "path";
import { v4 as uuidv4 } from 'uuid';
import Person from "../models/Person";
import { getUrlS3PassRecord } from "../lib/s3";
const now = new Date();
const { Op } = require("sequelize");


// ************************************************************************************************************************
// !                                                ULTIMAS 500 PASADAS / 2dias
// ************************************************************************************************************************

export const recordsToDay = async (req: Request, res: Response) => {
	try {
		//TODO : Hay que usar la ocupación ? const ocupacion = req.body.ocupacion || "";
		const userAuth = req.body.userAuth;
		const name = req.body.name || "";
		const rut = req.body.rut || "";
		const intervalo = req.body.intervalo || 365;
		const initDate = req.body.fecha || formatDate(now)

		const fecha = new Date(initDate);
		const fechaActual = sumarDias(fecha, 1).split("T", 1).toString();
		const fechaAnterior = restarDias(fecha, intervalo).split("T", 1).toString();

		let employee;
		let temp = req.body.temp || "";
		let turno = req.body.turno || "";
		let contratista = req.body.contratista || "";

		if (contratista == "all") {contratista = ""}
		if (turno == "all") {turno = ""}
		if (temp == "all") { temp = ""; }

		if (userAuth.role === "USC") {
			employee = userAuth.name;
		} else {
			!contratista ? (employee = "") : (employee = contratista);
		}

		const Pass_Records = await Pass_Record.findAll(
			{
				where: {
					[Op.and]: [
						{deleted_flag			: 0},
						{pass_direction			: {[Op.substring]: turno}},
						{pass_temperature_state	: {[Op.substring]: temp}},
						{person_name			: {[Op.substring]: name}},
						{person_no				: {[Op.substring]: rut}},
						{group_name				: {[Op.substring]: employee}},
						{pass_create_time		: {[Op.between]: [fechaAnterior, fechaActual]}}
					],
				},
				order: [
					['pass_create_time', 'DESC']],
				limit: 500
			}
		);
		Pass_Records.map((pass:any)=>{
			pass.dataValues.pass_img_url = getUrlS3PassRecord(pass.dataValues.pass_img_url)			
		})
		setTimeout(() => {
			return res.status(200).json(Pass_Records);
		}, 3000);

	} catch (error) {
		console.log(error);
		return res.status(500).json({ msg: "Contact the administrator" });
	}
};

// ************************************************************************************************************************
// !                                                Genera reporte 10000 registros
// ************************************************************************************************************************

export const downloadReportRecords = async (req: Request, res: Response) => {

	try {
		const userAuth = req.body.userAuth;
		const name = req.body.name || "";
		const rut = req.body.rut || "";
		const intervalo = req.body.intervalo || 365;
		const initDate = req.body.fecha || formatDate(now)

		const fecha = new Date(initDate);
		const fechaActual = sumarDias(fecha, 1).split("T", 1).toString();
		const fechaAnterior = restarDias(fecha, intervalo).split("T", 1).toString();

		let employee;
		let temp = req.body.temp || "";
		let turno = req.body.turno || "";
		let contratista = req.body.contratista || "";

		if (contratista == "all") {contratista = ""}
		if (turno == "all") {turno = ""}
		if (temp == "all") { temp = ""; }

		if (userAuth.role === "USC") {
			employee = userAuth.name;
		} else {
			!contratista ? (employee = "") : (employee = contratista);
		}

		const Pass_Records = await Pass_Record.findAll(
			{
				where: {
					[Op.and]: [
						{deleted_flag			: 0},
						{pass_direction			: {[Op.substring]: turno}},
						{pass_temperature_state	: {[Op.substring]: temp}},
						{person_name			: {[Op.substring]: name}},
						{person_no				: {[Op.substring]: rut}},
						{group_name				: {[Op.substring]: employee}},
						{pass_create_time		: {[Op.between]: [fechaAnterior, fechaActual]}}
					],
				},
				order: [
					['pass_create_time', 'DESC']],
				limit: 10000
			}
		);

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

		await Pass_Records?.forEach((row: any, index) => {
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

		const Filename = `${uuidv4()}.xlsx`;
		const pathExcel = path.join(__dirname, "../..", "excel", Filename);

		await wb.write(pathExcel, function (err: any, stats: any) {
			if (err) {
				console.log(err);
			} else {
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
	} catch (error) {
		console.log(error);
		res.status(500).json({ msg: "Contact the administrator" });
	}
};

// ************************************************************************************************************************
// !                                                Descarga del reporte excel
// ************************************************************************************************************************

export const downReport = async (req: Request, res: Response) => {
	try {
		let filename = req.params.resource_url;
		let url = path.join(__dirname, "../..", "excel", filename);
		res.status(200).download(url);
	} catch (error) {
		console.log(error);
		res.status(500).json({ msg: "Contact the administrator" });
	}
};

// ************************************************************************************************************************
// !                                                Eliminar una pasada
// ************************************************************************************************************************

export const deleteRecord = async (req: Request, res: Response) => {
	try {
		const id = req.params.id;
		const userAuth = req.body.userAuth;

		const data = {
			pass_update_time	: formatDate(now),
			pass_update_user	: userAuth.name,
			deleted_flag: 1
		}

		await Pass_Record.update(data, {where:{id}})

		return res.status(200).json({ msg: "Archivo Eliminado correctamente"});
	} catch (error) {
		console.log(error);
		res.status(500).json({ msg: "Contact the administrator" });
	}
}

// ************************************************************************************************************************
// !                                                Actualizar una pasada
// ************************************************************************************************************************

export const updateRecord = async (req: Request, res: Response) => {
	try {
		const id = req.params.id;
		const person = await Person.findOne({ where: { person_no: req.body.person_id } });
        console.log("🚀 ~ file: records.ts ~ line 232 ~ updateRecord ~ person", person)

		const data = {
			pass_direction		: req.body.turno,
			person_no			: person.person_no,
			person_name			: person.person_name,
			person_resource_url	: person.avatar_url,
			pass_update_time	: formatDate(now),
			pass_update_user	: req.body.userAuth.name,
		}

		await Pass_Record.update(data, {where:{id}})
		return res.status(200).json({ msg: "Archivo Actualizado correctamente"});

	} catch (error) {
		console.log(error);
		res.status(500).json({ msg: "Contact the administrator" });
	}
}