import Pass_Record from "../models/Pass_Record";

import { restarDias, sumarDias, formatDate } from "../utils/fecha";

const xl = require("excel4node");
import { v4 as uuidv4 } from 'uuid';
import Person from "../models/Person";
import { getUrlS3, getUrlS3PassRecord } from "../lib/s3";

import { Response, Request } from "express";
import path from "path";

const now = new Date();

const { Op, QueryTypes } = require("sequelize");

import db from "../db/connectionResgisters"
import Company from "../models/Company";

// ************************************************************************************************************************
// !                                                ULTIMAS 500 PASADAS / 2dias
// ************************************************************************************************************************

export const recordsToDay = async (req: Request, res: Response) => {
	try {
		const userAuth = req.body.userAuth;
		const name = req.body.name || "";
		const rut = req.body.rut || "";
		const intervalo = req.body.intervalo || 365;
		const initDate = req.body.fecha || formatDate(now)

		const page = req.body.page || ""


		let employee;
		let temp = req.body.temp || "";
		let turno = req.body.turno || "";
		let contratista = req.body.contratista || "";

		if (contratista == "all") {contratista = ""}
		if (turno == "all") {turno = ""}
		if (temp == "all") { temp = ""; }

		if (userAuth.role === "USC") {
			let employment:any = await Company.findAll({ where: {[Op.and]:[ { id: userAuth.employee }, {deleted_flag:0}] }  })
			employee = employment[0]?.name;
		} else {
			!contratista ? (employee = "") : (employee = contratista);
		}
		let Pass_Records!:any

		const fecha = new Date(initDate);
		let fechaActual
		let fechaAnterior
		

		if(intervalo == -1){
			fechaActual = sumarDias(fecha, -1).split("T", 1).toString();
			Pass_Records = await Pass_Record.findAll(
				{
					where: {
						[Op.and]: [
							{deleted_flag			: 0},
							{pass_direction			: {[Op.substring]: turno}},
							{pass_temperature_state	: {[Op.substring]: temp}},
							{person_name			: {[Op.substring]: name}},
							{person_no				: {[Op.substring]: rut}},
							{group_name				: {[Op.substring]: employee}},
							{pass_create_time		: {[Op.substring]: fechaActual}}
						],
					},
					order: [
						['pass_create_time', 'DESC']],
					limit: 5000
				}
			);
		}else{
			fechaActual = sumarDias(fecha,0);
			fechaAnterior = restarDias(fecha, intervalo+1);	
			Pass_Records = await Pass_Record.findAll(
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
					limit: 5000
				}
			);
		}
	

		Pass_Records.map((pass:any)=>{
			const urls = pass.dataValues.person_resource_url
			if(urls) pass.dataValues.resource_url = getUrlS3(pass.dataValues.group_name,  urls, pass.dataValues.person_no) 
			pass.dataValues.pass_img_url = getUrlS3PassRecord(pass.dataValues.pass_img_url)
		})

		setTimeout(() => {
			return res.status(200).json(Pass_Records);
		}, 2000);

	} catch (error) {
		console.log(error);
		return res.status(500).json({ msg: "Contact the administrator" });
	}
};

// ************************************************************************************************************************
// !                                                Genera reporte 10000 registros
// ************************************************************************************************************************

export const downloadReportNomina = async (req: Request, res: Response) => {

	try {
		const userAuth = req.body.userAuth;

		const name = req.body.name || "";
		const rut = req.body.rut || "";
        
		// const ocupacion = req.body.ocupacion || "";
        const now = new Date();
		const intervalo = req.body.intervalo || 365;
		const initDate = req.body.fecha || formatDate(now)


		let contratista = req.body.contratista || "";
		let employee;
		if (contratista == "all") {contratista = ""}



		if (userAuth.role === "USC") {
			let employment:any = await Company.findAll({ where: {[Op.and]:[ { id: userAuth.employee }, {deleted_flag:0}] }  })
			employee = employment[0]?.name;
		} else {
			!contratista ? (employee = "") : (employee = contratista);
		}

		let Persons!:any
		const fecha = new Date(initDate);
		let fechaActual
		let fechaAnterior
		
		if(intervalo == -1){
			fechaActual = sumarDias(fecha, -1).split("T", 1).toString();
			Persons = await Person.findAll(
				{
					attributes: [
						'id', 
						'email', 
						'person_name', 
						['update_time', 'create_time'],
						'status',
						['avatar_url', 'avatar'], 
						['person_no','id_card'],
						['employee_name','empresa'],
						['employment_name', 'ocupacion']
					],
					where: {
						[Op.and]: [
							{person_name: {[Op.substring]: name}},
							{person_no: {[Op.substring]: rut}},
							{employee_name: {[Op.substring]: employee}},
							{deleted_flag: 0},
							{update_time: {[Op.substring]: fechaAnterior}}
						],
					},
					order: [
						['update_time', 'DESC']],
					limit: 5000
				}
			);

		}else{
			fechaActual = sumarDias(fecha,0);
			fechaAnterior = restarDias(fecha, intervalo+1);	
			Persons = await Person.findAll(
				{
					attributes: [
						'id', 
						'email', 
						'person_name', 
						['update_time', 'create_time'],
						'status',
						['avatar_url', 'avatar'], 
						['person_no','id_card'],
						['employee_name','empresa'],
						['employment_name', 'ocupacion']
					],
					where: {
						[Op.and]: [
							{person_name: {[Op.substring]: name}},
							{person_no: {[Op.substring]: rut}},
							{employee_name: {[Op.substring]: employee}},
							{deleted_flag: 0},
							{update_time: {[Op.between]: [fechaAnterior, fechaActual]}}
						],
					},
					order: [
						['update_time', 'DESC']],
					limit: 5000
				}
			);
		}

	

		const wb = new xl.Workbook();
		const ws = wb.addWorksheet("Sheet 1");
		const style = wb.createStyle({
				font: {
					color: "#095B90",
					size: 12,
				},
				numberFormat: "$#,##0.00; ($#,##0.00); -",
		});


		ws.cell(1, 1).string("Fecha").style(style);
		ws.cell(1, 2).string("Rut").style(style);
		ws.cell(1, 3).string("Nombre").style(style);
		ws.cell(1, 4).string("Empresa").style(style);
		ws.cell(1, 5).string("Ocupacion").style(style);
		ws.cell(1, 6).string("Avatar").style(style);
		
		await Persons?.forEach((row: any, index:any) => {
			console.log(row.dataValues);
			ws.cell(index + 2, 1).date(new Date(row?.create_time));
			ws.cell(index + 2, 2).string(row?.dataValues.id_card || "");
			ws.cell(index + 2, 3).string(row?.dataValues.person_name|| "");
			ws.cell(index + 2, 4).string(row?.dataValues.empresa || "");
			ws.cell(index + 2, 5).string(row?.dataValues.ocupacion || "");
			ws.cell(index + 2, 6).string(row?.dataValues.avatar || "");
		});

		const Filename = `${uuidv4()}.xlsx`;
		const pathExcel = path.join(__dirname, "../", "excel", Filename);

		await wb.write(pathExcel, function (err: any, stats: any) {
			if (err) {
				console.log(err);
			} else {
				function downloadFile() {
					res.download(pathExcel);
					return res.status(200).json({ Filename: Filename, url: "http://localhost:8000/api/records/downreport"});
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
// !                                                Genera reporte 10000 registros
// ************************************************************************************************************************

export const downloadReportAsistencia = async (req: Request, res: Response) => {

	try {
		const userAuth = req.body.userAuth;

		const name = req.body.name || "";
		const rut = req.body.rut || "";
        
		// const ocupacion = req.body.ocupacion || "";
        const now = new Date();
		const intervalo = req.body.intervalo || 365;
		const initDate = req.body.fecha || formatDate(now)
		const fecha = new Date(initDate);
		const fechaActual = sumarDias(fecha, 2).split("T", 1).toString();
		const fechaAnterior = restarDias(fecha, intervalo).split("T", 1).toString();

		let contratista = req.body.contratista || "";
		let employee;
		if (contratista == "all") {contratista = ""}


		if (userAuth.role === "USC") {
			let employment:any = await Company.findAll({ where: {[Op.and]:[ { id: userAuth.employee }, {deleted_flag:0}] }  })
			employee = employment[0]?.name;
		} else {
			!contratista ? (employee = "") : (employee = contratista);
		}


		console.log(fechaActual);
		
        const asistencia = await db.query(`
            SELECT MIN(app_pass_records.pass_time) AS time, CAST(pass_create_time AS DATE) AS fecha, person_resource_url, person_name, person_no , group_name, calculated_shift
            FROM app_pass_records
            WHERE pass_direction = 1 AND person_no like '%${rut}%' AND person_name like '%${name}%' AND group_name like '%${employee}%' AND  pass_create_time BETWEEN '${fechaAnterior}' AND '${fechaActual}'
            GROUP BY person_no,person_resource_url, person_name, person_no , group_name, calculated_shift, CAST(pass_create_time AS DATE)
            ORDER BY  CAST(pass_create_time AS DATE) DESC
        `, { type: QueryTypes.SELECT });
        console.log("🚀 ~ file: records.ts ~ line 228 ~ downloadReportAsistencia ~ asistencia", asistencia)


		const wb = new xl.Workbook();
		const ws = wb.addWorksheet("Sheet 1");
		const style = wb.createStyle({
				font: {
					color: "#095B90",
					size: 12,
				},
				numberFormat: "$#,##0.00; ($#,##0.00); -",
		});


		ws.cell(1, 1).string("Hora").style(style);
		ws.cell(1, 2).string("Fecha").style(style);
		ws.cell(1, 3).string("Nombre").style(style);
		ws.cell(1, 4).string("Rut").style(style);
		ws.cell(1, 5).string("Empresa").style(style);

		await asistencia?.forEach((row: any, index) => {
			row.fecha = row.fecha.replace('-', '/')
            row.fecha = row.fecha.replace('-', '/')
            let dateUp =  new Date ( row.fecha)
            row.fecha = sumarDias(dateUp, 1).split("T", 1).toString()

			ws.cell(index + 2, 1).date(new Date(row?.time) || "");
			ws.cell(index + 2, 2).string(row?.fecha || "");
			ws.cell(index + 2, 3).string(row?.person_name || "");
			ws.cell(index + 2, 4).string(row?.person_no || "");
			ws.cell(index + 2, 5).string(row?.group_name || "");
		});

		const Filename = `${uuidv4()}.xlsx`;
		const pathExcel = path.join(__dirname,  "../","excel", Filename);

		await wb.write(pathExcel, function (err: any, stats: any) {
			if (err) {
				console.log(err);
			} else {
				function downloadFile() {
					res.download(pathExcel);
					return res.status(200).json({ Filename: Filename, url: "http://localhost:8000/api/records/downreport"});
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
// !                                                Genera reporte 10000 registros
// ************************************************************************************************************************

export const downloadReportRecords = async (req: Request, res: Response) => {

	try {
		const userAuth = req.body.userAuth;
		const name = req.body.name || "";
		const rut = req.body.rut || "";
		const intervalo = req.body.intervalo || 365;
		const initDate = req.body.fecha || formatDate(now)


		let employee;
		let temp = req.body.temp || "";
		let turno = req.body.turno || "";
		let contratista = req.body.contratista || "";

		if (contratista == "all") {contratista = ""}
		if (turno == "all") {turno = ""}
		if (temp == "all") { temp = ""; }

		if (userAuth.role === "USC") {
			let employment:any = await Company.findAll({ where: {[Op.and]:[ { id: userAuth.employee }, {deleted_flag:0}] }  })
			employee = employment[0]?.name;
		} else {
			!contratista ? (employee = "") : (employee = contratista);
		}
		let Pass_Records!:any
		const fecha = new Date(initDate);
		let fechaActual
		let fechaAnterior
		
		if(intervalo == -1){
			fechaActual = sumarDias(fecha, -1).split("T", 1).toString();
			Pass_Records = await Pass_Record.findAll(
				{
					where: {
						[Op.and]: [
							{deleted_flag			: 0},
							{pass_direction			: {[Op.substring]: turno}},
							{pass_temperature_state	: {[Op.substring]: temp}},
							{person_name			: {[Op.substring]: name}},
							{person_no				: {[Op.substring]: rut}},
							{group_name				: {[Op.substring]: employee}},
							{pass_create_time		: {[Op.substring]: fechaAnterior}}
						],
					},
					order: [
						['pass_create_time', 'DESC']],
					limit: 10000
				}
			);

		}else{
			fechaActual = sumarDias(fecha,0);
			fechaAnterior = restarDias(fecha, intervalo+1);	
			Pass_Records = await Pass_Record.findAll(
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
		}

	

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

		await Pass_Records?.forEach((row: any, index:any) => {
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
		const pathExcel = path.join(__dirname, "../", "excel", Filename);

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
// !                                                Genera reporte 10000 registros
// ************************************************************************************************************************

export const downloadReportCalculoHora = async (req: Request, res: Response) => {

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
			let employment:any = await Company.findAll({ where: {[Op.and]:[ { id: userAuth.employee }, {deleted_flag:0}] }  })
			employee = employment[0]?.name;
		} else {
			!contratista ? (employee = "") : (employee = contratista);
		}

        const asistencia = await db.query(`
            SELECT MIN(app_pass_records.pass_time) AS entrada, MAX(app_pass_records.pass_time) AS salida, CAST(pass_create_time AS DATE) AS fecha, person_resource_url, person_name, person_no , group_name, calculated_shift
            FROM app_pass_records
            WHERE pass_direction = 1 AND person_no like '%${rut}%' AND person_name like '%${name}%' AND group_name like '%${employee}%' AND  pass_create_time BETWEEN '${fechaAnterior}' AND '${fechaActual}'
            GROUP BY person_no,person_resource_url, person_name, person_no , group_name, calculated_shift, CAST(pass_create_time AS DATE)
            ORDER BY  CAST(pass_create_time AS DATE) DESC
        `, { type: QueryTypes.SELECT });
        let i = 0
        asistencia.forEach((persona:any) =>{
            persona.id = i
            persona.group_name = capitalizar(persona.group_name)
            let segundos = (persona.salida - persona.entrada)/1000
            let minutos =  Math.trunc(segundos/60)
            
            let segResto
            let minResto

            if (segundos%60 < 10){
                segResto = `0${segundos%60}`
            }else{
                segResto = segundos%60
            }

            if (minutos%60 < 10){
                minResto = `0${minutos%60}`
            }else{
                minResto = minutos%60
            }


            persona.calculo = `${Math.trunc(minutos/60)}:${minResto}:${segResto}`

            function capitalizar(str:any) {
                return str.replace(/\w\S*/g, function(txt:any){
                    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                });
            }

            persona.URL = getUrlS3(persona.group_name, persona.person_resource_url, persona.person_no)
            i++
        })
		console.log(asistencia);



		const wb = new xl.Workbook();
		const ws = wb.addWorksheet("Sheet 1");
		const style = wb.createStyle({
				font: {
					color: "#095B90",
					size: 12,
				},
				numberFormat: "$#,##0.00; ($#,##0.00); -",
		});

		ws.cell(1, 1).string("Entrada").style(style);
		ws.cell(1, 2).string("Salida").style(style);
		ws.cell(1, 3).string("Calculo").style(style);
		ws.cell(1, 4).string("Fecha").style(style);
		ws.cell(1, 5).string("person_name").style(style);
		ws.cell(1, 6).string("person_no").style(style);
		ws.cell(1, 7).string("group_name").style(style);
		ws.cell(1, 8).string("calculated_shift").style(style);


		await asistencia?.forEach((row: any, index) => {

			row.fecha = row.fecha.replace('-', '/')
            row.fecha = row.fecha.replace('-', '/')
            let dateUp =  new Date ( row.fecha)
            row.fecha = sumarDias(dateUp, 1).split("T", 1).toString()

			ws.cell(index + 2, 1).date(new Date(row?.entrada) || "");
			ws.cell(index + 2, 2).date(new Date(row?.salida) || "");
			ws.cell(index + 2, 3).string(row?.calculo);
			ws.cell(index + 2, 4).date(row?.fecha || "");
			ws.cell(index + 2, 5).string(row?.person_name || "");
			ws.cell(index + 2, 6).string(row?.person_no || "");
			ws.cell(index + 2, 7).string(row?.group_name || "");
			ws.cell(index + 2, 8).string(row?.calculated_shift || "");
		});

		const Filename = `${uuidv4()}.xlsx`;
		const pathExcel = path.join(__dirname, "../", "excel", Filename);

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
		let url = path.join(__dirname, "..", "excel", filename);
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

		const company = await Company.findOne({where: { name : person.employee_name }})
		console.log("🚀 ~ file: records.ts ~ line 607 ~ updateRecord ~ company", company)

		const data = {
			pass_direction		: req.body.turno,
			person_no			: person.person_no,
			person_name			: person.person_name,
			person_resource_url	: person.avatar_url,
			pass_update_time	: formatDate(now),
			pass_update_user	: req.body.userAuth.name,
			group_name			: person.employee_name,
			group_id			: company.id
		}

		await Pass_Record.update(data, {where:{id}})
		return res.status(200).json({ msg: "Archivo Actualizado correctamente"});

	} catch (error) {
		console.log(error);
		res.status(500).json({ msg: "Contact the administrator" });
	}
}