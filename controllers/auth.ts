import { NextFunction, Request, Response } from "express";
import { desencriptar, encriptar } from "../lib/bcrypt";
import { generarJWT } from "../lib/jsonwebtoken";

import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

import User from "../models/user";



// ************************************************************************************************************************
// !                                                     LOGIN
// ************************************************************************************************************************
export const login = async (req: Request, res: Response) => {
	try {
		const { email, password } = req.body;
		const user = await User.findOne({ where: { email } });

		if (!user) {
			return res.status(400).json({ msg: "Username or password do not match" });
		}

		const validPassword = await desencriptar(password, user.password);

		if (!validPassword) {
			return res.status(400).json({ msg: "Username or password do not match" });
		}

		if (user.deleted_flag === 1) {
			return res.status(400).json({ msg: "Suspended account. Contact the administrator" });
		}

		const token = await generarJWT(user.id);
		res.json({ user, token });
	} catch (error) {
		console.log(error);
		return res.status(500).json({ msg: "Contact the administrator" });
	}
};




// ************************************************************************************************************************
// !                                                     VALIDACIÓN DE TOKEN
// ************************************************************************************************************************
export const validacionToken = async ( req: Request, res: Response, next: NextFunction ) => {
	try {
		let token = req.header("Authorization");
		if (!token) {
			token = req.body.token
			if (!token) {
				return res.status(401).json({ msg: "No hay token en la petición" });
			}
		}

		const secretKey = process.env.SECRETTOPRIVATEKEY!;
		const payload: any = jwt.verify(token, secretKey);
		const userAuth: any = await User.findByPk(payload.uid);

		if (!userAuth) {
			return res.status(401).json({ msg: "Token no valido" });
		}
		if (userAuth.deleted_flag == 1) {
			return res.status(401).json({ msg: "Token no valido" });
		}

		switch (userAuth.role) {
			case "ADM":
				return res.status(200).json({ token, role: "ADM" });
				break;
			case "USM":
				return res.status(200).json({ token, role: "USM" });
				break;
			case "USC":
				return res.status(200).json({ token, role: "USC" });
				break;
			default:
				return res.status(401).json({ msg: "Token no valido" });
				break;
		}
		next();
	} catch (e) {
		res.status(403).json({ msg: "Token no valido" });
		console.log(e);
	}
};




// ************************************************************************************************************************
// !                                                     RECUPERAR CUENTA
// ************************************************************************************************************************
export const recoveryAccount = async (req: Request, res: Response) => {
	try {
		const email = req.body.email;
		const user = await User.findOne({ where: { email } });
		if (!user) {
			return res.status(400).json({ mensaje: "Usuario no encontrado" });
		} else {
			const token = await generarJWT(user.id);
			const transporter = nodemailer.createTransport({
				host: "smtp.office365.com",
				port: 587,
				auth: {
					user: process.env.EMAIL_RECOVERY,
					pass: process.env.PASSW_RECOVERY,
					},
			});
			let mailOption = await transporter.sendMail({
				from: '"Equipo Auditar" <aisense_bot@aisense.cl>', // sender address
				to: email, // list of receivers
				subject: "Recovery Password - SmartBoarding", // Subject line
				html: `
					<h1>Sistema de recuperación de contraseñas</h1>
					<p>Usted solicito una recuperación de contraseña desde el sitio ${process.env.SITE_WEB_URL}. <br> Para recuperar su contraseña ingrese al siguiente link y genere una nueva contraseña</p>
					
					<small>${process.env.SITE_WEB_URL}/#/recovery/${token}</small>
					</br>
					<a href="${process.env.SITE_WEB_URL}/#/recovery/${token}">Recuperar contraseña</a>

					`, // html body
			});
 			//TODO Ver si es que hay que colocar la url de la api o la dirección 
			transporter.sendMail(mailOption, (error: any, info: any) => {
				if (error) {
					res.status(500).send(error.message);
				} else {
					console.log("Email enviado");
					res.status(200).json(req.body);
				}
			});

			return res.status(200).json({ mensaje: "Se envió un correo de recuperación", estado: "ok" });
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({ msg: "Contact the administrator" });
	}
};



// ************************************************************************************************************************
// !                                                     CAMBIAR CONTRASEÑA
// ************************************************************************************************************************
export const changePassword = async (req: Request, res: Response) => {
	try {
		const token = req.params.token;
		const password = req.body.password;

		if (!token) return res.status(401).json({ msg: "No hay token en la petición" })
			
		const secretKey = process.env.SECRETTOPRIVATEKEY!;
		const payload: any = jwt.verify(token, secretKey);
		const userAuth: any = await User.findByPk(payload.uid);

		if (!userAuth) return res.status(401).json({ msg: "Usuario no existe" })
		if (userAuth.deleted_flag == 1) return res.status(401).json({ msg: "Usuario eliminado" });
		
		const newPassword = await encriptar(password)
		await User.update({ password: newPassword }, { where: { id: userAuth.id } });

		return res.status(200).json({msg:"Cambio de contraseña exitoso"});  
	} catch (error) {
		console.log(error);
		res.status(500).json({ msg: "Contact the administrator" });
	}
};
