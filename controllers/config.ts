import { NextFunction, Request, Response } from "express";
import { desencriptar, encriptar } from "../lib/bcrypt";
import { generarJWT } from "../lib/jsonwebtoken";
import { formatDate } from "../utils/fecha";

import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

import User from "../models/user";

export const changePassword = async (req: Request, res: Response) => {
    const fecha = new Date();

    const {password,newPassword,userAuth} = req.body

    const validPassword = await desencriptar(password, userAuth.password);

    if(validPassword){
        try {
            const updatePass = {
                password: await encriptar(newPassword),
                update_time:formatDate(fecha),
                update_user:userAuth.name,
            }

            await User.update( updatePass, { where: { id:userAuth.id } });
            const token = await generarJWT(userAuth.id);

            res.status(200).json({updatePass,token})
    
        } catch (error) {
            console.log(error);
            res.status(500).json({ msg: "Contact the administrator" });
        }
    }else{
        res.status(500).json({ msg: "Contraseña actual ingresada no es correcta" });
    }

}