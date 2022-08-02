import { Response, Request } from "express";
import path from "path";
import nodemailer from "nodemailer";
import { v4 as uuidv4 } from 'uuid';
import { unlink } from 'node:fs';

const xl = require("excel4node");
const { Op } = require("sequelize");

import Document from "../models/Document";
import Employment from "../models/Employment";
import Employee from "../models/Employee";
import Person from "../models/Person";
import Docfile from "../models/Docfile";
import User from "../models/user";

import { restarDias, sumarDias, formatDate } from "../utils/fecha";

import { generarPDF } from "../lib/pdfkit";
import { ftpDeploy } from "../lib/ftpDeploy";
import { readQRCode } from "../lib/qr-decode";
import Company from "../models/Company";
import { getS3ListPerson, getUrlS3, getUrlS3Docfile, putS3newPerson, putS3newPersonDocfile } from "../lib/s3";

const now = new Date();


// ************************************************************************************************************************
// !                                             Obtengo primero 500 registros de las personas
// ************************************************************************************************************************

export const getPersons = async (req: Request, res: Response) => {
	try {
		const userAuth = req.body.userAuth;
		const name = req.body.name || "";
		const rut = req.body.rut || "";
		const ocupacion = req.body.ocupacion || "";
		const intervalo = req.body.intervalo || 365;
		const initDate = req.body.fecha || formatDate(now)

		const fecha = new Date(initDate);
		const fechaActual = sumarDias(fecha, 1).split("T", 1).toString();
		const fechaAnterior = restarDias(fecha, intervalo).split("T", 1).toString();

		let turno = req.body.turno || "";
		let contratista = req.body.contratista || "";
		let employee;

		if (contratista == "all") {contratista = ""}
		if (turno == "all") {turno = ""}

		if (userAuth.role === "USC") {
			employee = userAuth.name;
		} else {
			!contratista ? (employee = "") : (employee = contratista);
		}

		const Persons = await Person.findAll(
			{
				attributes: [
					'id', 
					'email', 
					'person_name', 
					'create_time', 
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
						{employment_name: {[Op.substring]: ocupacion}},
						{deleted_flag: 0},
						{create_time: {[Op.between]: [fechaAnterior, fechaActual]}}
					],
				},
				order: [
					['create_time', 'DESC']],
				limit: 500
			}
		);
		await Persons.map((Person:any)=>{
			Person.dataValues.URL = getUrlS3(Person.dataValues.empresa, Person.dataValues.avatar, Person.dataValues.id_card)
		})
		return res.json(Persons);
	} catch (error) {
		console.log(error);
		return res.status(500).json({ msg: "Contact the administrator" });
	}
};

// ************************************************************************************************************************
// !                                             Obtengo las ocupaciones mediante el id.
// ************************************************************************************************************************

export const getEmployment = async (req: Request, res: Response) => {
	try{
		let employment
		const id = req.params.id
		const { userAuth } = req.body;

		(userAuth.role === "USC") 
			?	employment = await Employment.findAll({ where: {[Op.and]:[ { employee: userAuth.id }, {deleted_flag:0}] }  })
			:	employment = await Employment.findAll({ where: {[Op.and]:[ { employee: id }, {deleted_flag:0}] }  })

		if (employment.length == 0) {
			employment 	= 	[{	id: 1, employment: "No seleccionado"}];
		}
		return res.json(employment);

	} catch (error) {
		console.log(error);
		return res.status(500).json({ msg: "Contact the administrator" });
	}
};

// ************************************************************************************************************************
// !                                             Actualizo los datos de las personas.
// ************************************************************************************************************************

export const updateDatos = async (req: Request, res: Response) => {
	try {
		const person_no = req.params.id; //TODO aqui tiene que llegar el person_no (rut)
		const {name, email, ocupacion, userAuth} = req.body

		const Person_data = {
			name,
			email,
			employment_name : await Employment.findOne({where:{id:ocupacion}, attributes: ['employment']}),
			update_time : formatDate(now),
			update_user : userAuth.name
		}

		const Employee_data = {
			ocupacion,
			update_time : formatDate(now),
			update_user : userAuth.name   
		}

		await Person.update(Person_data, {where: {person_no} });
		await Employee.update(Employee_data, {where: {person_no} });

		return res.status(200).json({  msg: "Actualización realizada" });
	} catch (error) {
		console.log(error);
		return res.status(500).json({ msg: "Contact the administrator" });
	}
};

// ************************************************************************************************************************
// !                                             Genera y descarga la ficha de la persona.
// ************************************************************************************************************************

export const getFichaPerson = async (req: Request, res: Response) => {
	try {
		const rut = req.params.rut;
		const Filename = `${uuidv4()}.pdf`;
		const Persons = await Person.findOne({where: {[Op.and]: [{person_no: {[Op.substring]: rut}},{deleted_flag: 0}]}});
		await generarPDF(Persons, Filename);
		setTimeout(() => { 
			return res.status(200).json(Filename)
		}, 3000);

	} catch (error) {
		console.log(error);
		res.status(500).json({ msg: "Contact the administrator" });
	}
};

// ************************************************************************************************************************
// !                                             Obtengo los datos de una persona con su rut.
// ************************************************************************************************************************

export const getPerson = async (req: Request, res: Response) => {
	try{
		const rut = req.params.rut;
		const Person_find = await Person.findOne({where:{ [Op.and]:[ { person_no : rut }, { deleted_flag:0 } ] }});
		Person_find.dataValues.URL = getUrlS3(Person_find.dataValues.employee_name, Person_find.dataValues.avatar_url, Person_find.dataValues.person_no)
		const Employee_find = await Employee.findOne({where:{ [Op.and]:[ { person_no : rut }, { deleted_flag:0 } ] }});
		const Docfile_find = await Docfile.findAll({where:{ [Op.and]:[ { person_no : rut }, { deleted_flag:0 } ] }});

		return res.json({ Person_find, Docfile_find, Employee_find });
	} catch (error) {
		console.log(error);
		res.status(500).json({ msg: "Contact the administrator" });
	}
};

// ************************************************************************************************************************
// !                                             Obtengo todos las ocupaciones que existen siendo admin.
// ************************************************************************************************************************

export const getAllEmployment = async (req: Request, res: Response) => {
	try{
		const userAuth = req.body.userAuth;
		if (userAuth.role === "ADM") {
			const employment = await Employment.findAll({where:{deleted_flag:0}});
			return res.json(employment);
		}
	} catch (error) {
		console.log(error);
		res.status(403).json({ msg: "Contact the administrator" });
	}
};

// ************************************************************************************************************************
// !                                             Obtengo todos los documentos relacionados a una persona.
// ************************************************************************************************************************

export const getDocumentsPerson = async (req: Request, res: Response) => {
	try {
		const { idDoc, id_person } = req.body;
		const Docfile_find = await Docfile.findAll({where:{ [Op.and]:[ { person_no : id_person }, { document_id : idDoc }, { deleted_flag:0 } ] }});
		
		return res.json(Docfile_find);
	} catch (error) {
		console.log(error);
		res.status(500).json({ msg: "Contact the administrator" });
	}
};

// ************************************************************************************************************************
// !                                             Obtengo todos los documentos relacionados a una ocupacion.
// ************************************************************************************************************************

export const getDocuments = async (req: Request, res: Response) => {
	try {
		const id = req.body.ocupacion || "";
		const documents = await Document.findAll({where: { [Op.and]:[{employment_id: id},{ deleted_flag:0 } ] }});
		return res.json(documents);
	} catch (error) {
		console.log(error);
		res.status(500).json({ msg: "Contact the administrator" });
	}
};

// ************************************************************************************************************************
// !                                             Descargo un documento cargado usando el nombre de este.
// ************************************************************************************************************************

export const downloadDoc = async (req: Request, res: Response) => {
	console.log(req.body);
	
	try {
		const url = getUrlS3Docfile(req.body.group_name,req.body.name, req.body.person_no)
		res.status(200).json(url);

	} catch (error) {
		console.log(error);
		res.status(500).json({ msg: "Contact the administrator" });
	}
};
// ************************************************************************************************************************
// !                                             Descargo un documento cargado usando el nombre de este.
// ************************************************************************************************************************

export const downloadFicha = async (req: Request, res: Response) => {
	try {
		let filename = req.params.resource_url;
		let url = path.join(__dirname, "../..", "uploads/fichas", filename);
		res.status(200).download(url);
	} catch (error) {
		console.log(error);
		res.status(500).json({ msg: "Contact the administrator" });
	}
};

// ************************************************************************************************************************
// !                                             Valida un rut si esta utilizado en una empresa.
// ************************************************************************************************************************

export const validarRut = async (req: Request, res: Response) => {
	try {
		const rut = req.body.rut;
		const Employee_find = await Employee.findAll({where:{[Op.and]:[{person_no:rut},{ deleted_flag:0 }]}});
		if (Employee_find.length === 0) {
			return res.status(200).json(true);
		} else {
			return res.status(400).json({ msg: "Rut ya registrado" });
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({ msg: "Contact the administrator" });
	}
};


// ************************************************************************************************************************
// !                                             Agrega una nueva persona a los registros (data y avatar).
// ************************************************************************************************************************

export const addPerson = async (req: Request, res: Response) => {
	
	const { person_no, name, gender, email, employee, employment, qr_url, userAuth } = req.body
	const imagen = req.file;
	const Filename = `${uuidv4()}.png`;

	const UsuarioExiste = await Person.findOne({where: { person_no }});
	const Employee_find = await Company.findOne({where: { id: employee }});
	const Employment_find = await Employment.findOne({where: { id: employment }});
	
	const addPersonBucket = putS3newPerson(imagen,Employee_find.name,person_no, Filename)
	
	//  TODO Modularizar el código de abajo
	// var request = require('request');
	// const ArrDiviceKey = ['F4970C5C3419ACBC','EF38DD40511C2EB2'];

	// let options

	// options = {
	// 	'method': 'POST',
	// 	'url': '154.53.37.187:8190/api/person/add',
	// 	'headers': {
	// 		'Content-Type': 'application/x-www-form-urlencoded'
	// 	},
	// 	form: {
	// 		'deviceKey': 'F4970C5C3419ACBC',
	// 		'secret': 'tdx',
	// 		'id': person_no,
	// 		'name': name,
	// 		'idcardNum': qr_url,
	// 		'expireTime': '',
	// 		'blacklist': '',
	// 		'vaccination': '',
	// 		'vaccinationTime': '',
	// 		'remark': 'El Big Boss'
	// 	}
	// };
	// request(options, function (error:any, response:any) {
	// 	if (error) throw new Error(error);
	// 	console.log(response.body);
	// });


	try {
		if(UsuarioExiste){
			const updatePerson = {
				person_name:name,
				gender,
				email,
				qr_url,
				employee_name : Employee_find.name,
				employment_name : Employment_find.name,
				status:1,
				avatar_url : Filename,
				avatar_alias : imagen?.originalname,
				avatar_size : imagen?.size,
				avatar_dimensions : "700*700",
				avatar_suffix : ".png",
				update_time: formatDate(new Date()),
				update_user : userAuth.name,
				deleted_flag: 0
			}
			await Person.update( updatePerson , { where: { person_no: person_no } });

			const updateEmployee = {
				employer:employee,
				person_no,
				employment,
				update_time: formatDate(new Date()),
				update_user : userAuth.name,
				deleted_flag: 0
			}
			await Employee.update( updateEmployee , { where: { person_no:person_no } });
            return res.status(200).json({status:'ok'})
		}else{
			const newPerson = {
				person_no,
				person_name:name,
				gender,
				email,
				qr_url,
				employee_name : Employee_find.name,
				employment_name : Employment_find.name,
				avatar_url : Filename,
				avatar_alias : imagen?.originalname,
				avatar_size : imagen?.size,
				avatar_dimensions : "700*700",
				avatar_suffix : ".png",
				create_user : userAuth.name
			}
			
			const respPerson = Person.build(newPerson);
			await respPerson.save()
			
			const newEmployee = {
				employer:employee,
				person_no,
				employment,
				create_user : userAuth.name
			}
			const respEmployee = Employee.build(newEmployee);
			await respEmployee.save()
			return res.status(200).json(respEmployee)
		}
    } catch (error) {
		console.log(error);
		res.status(500).json({ msg: "Contact the administrator" });
    }
}; 

// ************************************************************************************************************************
// !                                             Entrega una vista previa de la foto cargada.
// ************************************************************************************************************************

export const photoPreview = async (req: Request, res: Response) => {
	try {
		const request = require("request");
		const fs = require("fs");
		const imagen = req.file;
        console.log("🚀 ~ file: person.ts ~ line 376 ~ photoPreview ~ req.file", req.file)
		const idLuxand = req.body.idLuxand
		
		if (req.file) {

			const docfile_url= `documents/${req.file?.filename}`
			let url = path.join(__dirname, "../..", "uploads/",req.file?.filename);
	
			var options = {
					method: 'POST', 
					url: `https://api.luxand.cloud/photo/verify/${idLuxand}`, 
					qs: {}, 
					headers: { 'token': "944628c81d2347cdac8941c17ab8e866" }, 
					formData: { photo: fs.createReadStream(url) 

			} }; 
			const resource = request(options,function (error: any, response: any, body: any) {
				if (error) throw new Error(error);
				const respuesta = JSON.parse(body)
				console.log(respuesta);
				console.log(body);
				// console.log(deleteRegister(idLuxand));
				return res.status(200).json({respuesta, docfile_url});
				// return res.status(200).json({respuesta,resizedImageBuffer});
			}
			);
		}


		// const deleteRegister=(idLuxand:any)=>{
		// 	const optDelete = {
		// 			method: 'DELETE', 
		// 			url: `https://api.luxand.cloud/subject/${idLuxand}`, 
		// 			qs: {}, 
		// 			headers: { 'token': "944628c81d2347cdac8941c17ab8e866" } 
		// 		};
		// 	request(optDelete, function (error:any, response:any, body:any) { 
		// 		if (error) throw new Error(error); 
		// 		console.log(body);
		// 		return body
		// 	});
		// }


	} catch (error) {
		console.log(error);
		res.status(500).json({ msg: "Contact the administrator" });
	}
};

// ************************************************************************************************************************
// !                                             Agrega documentos usando el rut del usuario.
// ************************************************************************************************************************

export const docsFile = async (req: Request, res: Response) => {
	try {
		if (req.file) {
			const file = req.file;
			const Filename = `${uuidv4()}${path.extname(req.file!.originalname)}`;
			const {userAuth, employment_id, person_no, document_name , document_id, empresa} = req.body;

			putS3newPersonDocfile(file, empresa, person_no, Filename)

			const newDocfile = {
				employment_id,
				person_no,
				document_name,
				document_id,
				docfile_url: Filename,
				docfile_alias: req.file?.originalname,
				docfile_size: Math.trunc(req.file?.size / 1000),
				docfile_suffix: path.extname(req.file!.originalname),
				create_user: userAuth.name
			}

			const respDocfile = Docfile.build(newDocfile);
			await respDocfile.save()
			return res.status(200).json(respDocfile);
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({ msg: "Contact the administrator" });
	}
};
// ************************************************************************************************************************
// !                                             Agrega documentos usando el rut del usuario.
// ************************************************************************************************************************

export const IdcardFront = async (req: Request, res: Response) => {
	try {
		if (req.file) {
			const request = require("request");
			const fs = require("fs");

			const docfile_url= `uploads/${req.file?.filename}`
			let url = path.join(__dirname, "../..", "uploads",req.file?.filename);

			const options = { 
				method: 'POST', 
				url: "https://api.luxand.cloud/subject/v2", 
				qs: {"name":"","store":"1"}, 
				headers: { 'token': `${process.env.TOKEN_LUXAND}` }, 
				formData: { photo: fs.createReadStream(url) }
			}
			request(options, function (error:any, response:any, body:any) { 
				if (error) throw new Error(error)
				let id = JSON.parse(body)
				fs.unlink(url, (err:any) => { if (err) throw err; console.log(url) });
				return res.status(200).json({id, docfile_url});
			});
	
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({ msg: "Contact the administrator" });
	}
};


/// ************************************************************************************************************************
// !                                             Elimina una persona con todos sus archivos.
// ************************************************************************************************************************

export const deletePerson = async (req: Request, res: Response) => {
	try {
		const person_no = req.params.id;
        console.log("🚀 ~ file: person.ts ~ line 532 ~ deletePerson ~ person_no", person_no)
		const userAuth = req.body.userAuth;

		const data = {
			update_time	: formatDate(now),
			update_user	: userAuth.name,
			deleted_flag: 1
		}

		await Person.update(data, {where:{person_no}})
		await Employee.update(data, {where:{person_no}})
		await Docfile.update(data, {where:{person_no}})

		return res.status(200).json({ msg: "Usuario Eliminado correctamente"});
	} catch (error) {
		console.log(error);
		res.status(500).json({ msg: "Contact the administrator" });
	}
};

/// ************************************************************************************************************************
// !                                             Elimina un solo archivo usando su id.
// *************************************************************************************************************************

export const deleteFile = async (req: Request, res: Response) => {
	try {
		const id = req.params.id;
		const userAuth = req.body.userAuth;

		const data = {
			update_time	: formatDate(now),
			update_user	: userAuth.name,
			deleted_flag: 1
		}

		await Docfile.update(data, {where:{id}})

		return res.status(200).json({ msg: "Archivo Eliminado correctamente"});
	} catch (error) {
		console.log(error);
		res.status(500).json({ msg: "Contact the administrator" });
	}
};

/// ************************************************************************************************************************
// !                                             Envia un email para soltar un empleado.
// *************************************************************************************************************************

export const sendEmailDeletePerson = async (req: Request, res: Response) => {
	try {
		const person_no = req.body.rut;

		const Person_find = await Person.findOne({where:{[Op.and]:[{person_no},{deleted_flag:0}]}})
		const Employer_find = await User.findOne({where:{name:Person_find.employee_name}})
		const Mandante_find = await User.findOne({where:{id:Employer_find.employee}})

		const email = Mandante_find.email;
		const nombre = Mandante_find.name;
		const empresaNombre = Employer_find.name;
		const empresaEmail = Employer_find.email;
		const personaNombre = Person_find.person_name;
		const personaRut = Person_find.person_no;

		const transporter = nodemailer.createTransport({
			host: "smtp.office365.com",
			port: 587,
			auth: {
			user: process.env.EMAIL_RECOVERY,
			pass: process.env.PASSW_RECOVERY,
			},
		});

		const mandante = await transporter.sendMail({
			from: '"Equipo Auditar" <aisense_bot@aisense.cl>', // sender address
			to: email, // list of receivers
			subject: "Solicitud de eliminación de usuario - SmartBoarding", // Subject line
			html: `
				<h1>Equipo de ${nombre}</h1>
				<p>Se solicita que se pueda poner en contacto con la empresa ${empresaNombre}, email: ${empresaEmail}, para poder dar de baja al trabajador ${personaNombre} con rut ${personaRut} ya 
				que otra empresa, que utiliza Smartboarding necesita enrolarlo a en su equipo de trabajo.</p>
				<p> Saludos</p>
				`,
		});

		transporter.sendMail(mandante, (error: any, info: any) => {
			if (error) {
				res.status(500).send(error.message);
			} else {
				console.log("Email enviado");
				res.status(200).json(req.body);
			}
		});






		return res.status(200).json({ mensaje: "Se envió un correo de recuperación", estado: "ok" });
	} catch (error) {
		console.log(error);
		res.status(500).json({ msg: "Contact the administrator" });
	}
};

/// ************************************************************************************************************************
// !                                             Genera un reporte excel.
// *************************************************************************************************************************

export const downloadReportRecords = async (req: Request, res: Response) => {
	try {
		const userAuth = req.body.userAuth;
		const name = req.body.name || "";
		const rut = req.body.rut || "";
		const ocupacion = req.body.ocupacion || "";
		const intervalo = req.body.intervalo || 365;
		const initDate = req.body.fecha || formatDate(now)

		const fecha = new Date(initDate);
		const fechaActual = sumarDias(fecha, 1).split("T", 1).toString();
		const fechaAnterior = restarDias(fecha, intervalo).split("T", 1).toString();

		let turno = req.body.turno || "";
		let contratista = req.body.contratista || "";
		let employee;

		if (contratista == "all") {contratista = ""}
		if (turno == "all") {turno = ""}

		if (userAuth.role === "USC") {
			employee = userAuth.name;
		} else {
			!contratista ? (employee = "") : (employee = contratista);
		}

		const Persons = await Person.findAll(
			{
				attributes: [
					'id', 
					'email', 
					'person_name', 
					'create_time', 
					['avatar_url', 'avatar'], 
					['person_no','id_card'],
					['employee_name','empresa'],
					['employment_name', 'ocupacion']
				],
				where: {
					[Op.and]: [
						{person_name: {[Op.substring]: name}},
						{person_no: {[Op.substring]: rut}},
						{employee_name: employee},
						{employment_name: ocupacion},
						{deleted_flag: 0},
						{create_time: {[Op.between]: [fechaAnterior, fechaActual]}}
					],
				},
				order: [
					['create_time', 'DESC']],
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

		ws.cell(1, 1).string("Rut").style(style);
		ws.cell(1, 2).string("Nombre").style(style);
		ws.cell(1, 3).string("Genero").style(style);
		ws.cell(1, 4).string("Email").style(style);
		ws.cell(1, 5).string("Foto").style(style);
		ws.cell(1, 6).string("Estado").style(style);
		ws.cell(1, 7).string("Empresa").style(style);
		ws.cell(1, 8).string("Ocupación").style(style);
		ws.cell(1, 9).string("Creación").style(style);
		await Persons?.forEach((row: any, index) => {
			ws.cell(index + 2, 1).string(row?.person_no || "");
			ws.cell(index + 2, 2).string(row?.person_name || "");
			ws.cell(index + 2, 3).string(row?.gender || "");
			ws.cell(index + 2, 4).string(row?.email || "");
			ws.cell(index + 2, 5).string(row?.avatar_url || "");
			ws.cell(index + 2, 6).string(row?.status || "");
			ws.cell(index + 2, 7).string(row?.employee_name || "");
			ws.cell(index + 2, 8).string(row?.employment_name || "");
			ws.cell(index + 2, 9).date(new Date(row?.create_time));
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
/// ************************************************************************************************************************
// !                                             Elimina un solo archivo usando su id.
// *************************************************************************************************************************
export const downReport = async (req: Request, res: Response) => {
	try{
		const filename = req.params.resource_url;
		const url = path.join(__dirname, "../..", "excel", filename);
		res.status(200).download(url);
	} catch (error) {
		console.log(error);
		res.status(500).json({ msg: "Contact the administrator" });
	}
};
//*********************
