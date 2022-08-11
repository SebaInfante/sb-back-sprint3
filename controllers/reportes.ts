import { Response, Request } from "express";
import path from "path";

const now = new Date();
const { Op, QueryTypes } = require("sequelize");

import db from "../db/connectionResgisters"

import {  getUrlS3  } from "../lib/s3";


export const asistencia = async (req: Request, res: Response) => {
    const userAuth = req.body.userAuth;
    let employee='';
    if (userAuth.role === "USC")  employee = userAuth.name;

    try {
        const asistencia = await db.query(`
                SELECT CAST(pass_create_time AS DATE) AS fecha, person_resource_url, person_name, person_no , group_name, calculated_shift
                FROM app_pass_records
                WHERE pass_direction = 1 AND person_no <> '' AND group_name like '%${employee}%'
                GROUP BY person_no,person_resource_url, person_name, person_no , group_name, calculated_shift, CAST(pass_create_time AS DATE)
                ORDER BY  CAST(pass_create_time AS DATE) DESC
        `, { type: QueryTypes.SELECT });

        let i = 0
        asistencia.forEach((persona:any) =>{
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
