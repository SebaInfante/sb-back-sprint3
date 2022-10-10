import { Response, Request } from "express";
const { Op, QueryTypes } = require("sequelize");

import db from "../db/connectionResgisters"
import {  getUrlS3  } from "../lib/s3";
import Company from "../models/Company";
import Person from "../models/Person";
import { formatDate, restarDias, sumarDias } from "../utils/fecha";


export const asistencia = async (req: Request, res: Response) => {
    let now = new Date()
    const userAuth = req.body.userAuth;const rut = req.body.rut || "";
    const intervalo = req.body.intervalo || 365;
    console.log("🚀 ~ file: reportes.ts ~ line 15 ~ asistencia ~ intervalo", intervalo)
    const initDate = req.body.fecha || formatDate(now)
    console.log("🚀 ~ file: reportes.ts ~ line 17 ~ asistencia ~ initDate", initDate)
    let contratista
    let employee='';
    if (userAuth.role === "USC") {
        let employment:any = await Company.findAll({ where: {[Op.and]:[ { id: userAuth.employee }, {deleted_flag:0}] }  })
        employee = employment[0]?.name;
    } else {
        !contratista ? (employee = "") : (employee = contratista);
    }


    try {
        const asistencia = await db.query(`
            SELECT MIN(app_pass_records.pass_time) AS time, CAST(pass_create_time AS DATE) AS fecha, person_resource_url, person_name, person_no , group_name, calculated_shift
            FROM app_pass_records
            WHERE pass_direction = 1 AND person_no <> '' AND group_name like '%${employee}%'
            GROUP BY person_no,person_resource_url, person_name, person_no , group_name, calculated_shift, CAST(pass_create_time AS DATE)
            ORDER BY  CAST(pass_create_time AS DATE) DESC
        `, { type: QueryTypes.SELECT });
        let i = 0
        asistencia.forEach((persona:any) =>{
            persona.fecha = persona.fecha.replace('-', '/')
            persona.fecha = persona.fecha.replace('-', '/')
            let dateUp =  new Date ( persona.fecha)
            persona.fecha = sumarDias(dateUp, 1).split("T", 1).toString()
            persona.id = i
            persona.group_name = capitalizar(persona.group_name)

            function capitalizar(str:any) {
                return str.replace(/\w\S*/g, function(txt:any){
                    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                });
            }

            persona.URL = getUrlS3(persona.group_name, persona.person_resource_url, persona.person_no)
            i++
        })

        return res.status(200).json(asistencia);
    } catch (error) {
        console.log(error);
		return res.status(500).json({ msg: "Contact the administrator" });
    }
}

export const filtrarAsistencia = async (req: Request, res: Response) => {
    const userAuth = req.body.userAuth;
    let employee='';

    const now = new Date();
    const name = req.body.name || "";
    const rut = req.body.rut || "";
    const intervalo = req.body.intervalo || 365;
    const initDate = req.body.fecha || formatDate(now)

    const fecha = new Date(initDate);

    let contratista
    if (userAuth.role === "USC") {
        let employment:any = await Company.findAll({ where: {[Op.and]:[ { id: userAuth.employee }, {deleted_flag:0}] }  })
        employee = employment[0]?.name;
    } else {
        !contratista ? (employee = "") : (employee = contratista);
    }
    let fechaActual
	let fechaAnterior
    let asistencia
    try {
        if(intervalo == -1){
            fechaActual = sumarDias(fecha, -1).split("T", 1).toString();
            asistencia = await db.query(`
            SELECT MIN(app_pass_records.pass_time) AS time, CAST(pass_create_time AS DATE) AS fecha, person_resource_url, person_name, person_no , group_name, calculated_shift
            FROM app_pass_records
            WHERE pass_direction = 1 AND person_no like '%${rut}%' AND person_name like '%${name}%' AND group_name like '%${employee}%' AND  pass_create_time like '%${fechaActual}%'
            GROUP BY person_no,person_resource_url, person_name, person_no , group_name, calculated_shift, CAST(pass_create_time AS DATE)
            ORDER BY  CAST(pass_create_time AS DATE) DESC
            `, { type: QueryTypes.SELECT });

        }else{
            fechaActual = sumarDias(fecha,0);
            fechaAnterior = restarDias(fecha, intervalo+1);	
            asistencia = await db.query(`
            SELECT MIN(app_pass_records.pass_time) AS time, CAST(pass_create_time AS DATE) AS fecha, person_resource_url, person_name, person_no , group_name, calculated_shift
            FROM app_pass_records
            WHERE pass_direction = 1 AND person_no like '%${rut}%' AND person_name like '%${name}%' AND group_name like '%${employee}%' AND  pass_create_time BETWEEN '${fechaAnterior}' AND '${fechaActual}'
            GROUP BY person_no,person_resource_url, person_name, person_no , group_name, calculated_shift, CAST(pass_create_time AS DATE)
            ORDER BY  CAST(pass_create_time AS DATE) DESC
            `, { type: QueryTypes.SELECT });
        }


        let i = 0
        asistencia.forEach((persona:any) =>{
            persona.fecha = persona.fecha.replace('-', '/')
            persona.fecha = persona.fecha.replace('-', '/')
            let dateUp =  new Date ( persona.fecha)
            persona.fecha = sumarDias(dateUp, 1).split("T", 1).toString()

            persona.id = i
            persona.group_name = capitalizar(persona.group_name)

            function capitalizar(str:any) {
                return str.replace(/\w\S*/g, function(txt:any){
                    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                });
            }

            persona.URL = getUrlS3(persona.group_name, persona.person_resource_url, persona.person_no)
            i++
        })


        return res.status(200).json(asistencia);
    } catch (error) {
        console.log(error);
		return res.status(500).json({ msg: "Contact the administrator" });
    }
}

export const filtrarNomina = async (req: Request, res: Response) => {
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
		await Persons.map((Person:any)=>{
			Person.dataValues.URL = getUrlS3(Person.dataValues.empresa, Person.dataValues.avatar, Person.dataValues.id_card)
		})
		return res.json(Persons);
	} catch (error) {
		console.log(error);
		return res.status(500).json({ msg: "Contact the administrator" });
	}

}

export const calculoHora = async (req: Request, res: Response) => {
    const userAuth = req.body.userAuth;
    let employee='';

    const now = new Date();
    const name = req.body.name || "";
    const rut = req.body.rut || "";
    const intervalo = req.body.intervalo || 365;
    const initDate = req.body.fecha || formatDate(now)

    const fecha = new Date(initDate);
    const fechaActual = sumarDias(fecha, 1).split("T", 1).toString();
    const fechaAnterior = restarDias(fecha, intervalo).split("T", 1).toString();
let contratista


    if (userAuth.role === "USC") {
        let employment:any = await Company.findAll({ where: {[Op.and]:[ { id: userAuth.employee }, {deleted_flag:0}] }  })
        employee = employment[0]?.name;
    } else {
        !contratista ? (employee = "") : (employee = contratista);
    }


    try {
        const asistencia = await db.query(`
            SELECT MIN(app_pass_records.pass_time) AS entrada, MAX(app_pass_records.pass_time) AS salida, CAST(pass_create_time AS DATE) AS fecha, person_resource_url, person_name, person_no , group_name, calculated_shift
            FROM app_pass_records
            WHERE pass_direction = 1 AND person_no like '%${rut}%' AND person_name like '%${name}%' AND group_name like '%${employee}%' AND  pass_create_time BETWEEN '${fechaAnterior}' AND '${fechaActual}'
            GROUP BY person_no,person_resource_url, person_name, person_no , group_name, calculated_shift, CAST(pass_create_time AS DATE)
            ORDER BY  CAST(pass_create_time AS DATE) DESC
        `, { type: QueryTypes.SELECT });
        let i = 0
        asistencia.forEach((persona:any) =>{
            persona.fecha = persona.fecha.replace('-', '/')
            persona.fecha = persona.fecha.replace('-', '/')
            let dateUp =  new Date ( persona.fecha)
            persona.fecha = sumarDias(dateUp, 1).split("T", 1).toString()

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

        return res.status(200).json(asistencia);
    } catch (error) {
        console.log(error);
		return res.status(500).json({ msg: "Contact the administrator" });
    }
}

// SELECT MIN(app_pass_records.pass_time) AS entrada, MAX(app_pass_records.pass_time) AS salida, CAST(pass_create_time AS DATE) AS fecha, person_resource_url, person_name, person_no , group_name, calculated_shift
// FROM app_pass_records
// WHERE pass_direction = 1 AND person_no like '%${rut}%' AND person_name like '%${name}%' AND group_name like '%${employee}%' AND  pass_create_time BETWEEN '${fechaAnterior}' AND '${fechaActual}'
// GROUP BY person_no,person_resource_url, person_name, person_no , group_name, calculated_shift, CAST(pass_create_time AS DATE)
// ORDER BY  CAST(pass_create_time AS DATE) DESC