"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.recoveryAccount = exports.validacionToken = exports.login = void 0;
const bcrypt_1 = require("../lib/bcrypt");
const jsonwebtoken_1 = require("../lib/jsonwebtoken");
const jsonwebtoken_2 = __importDefault(require("jsonwebtoken"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const user_1 = __importDefault(require("../models/user"));
// ************************************************************************************************************************
// !                                                     LOGIN
// ************************************************************************************************************************
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await user_1.default.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ msg: "Username or password do not match" });
        }
        const validPassword = await (0, bcrypt_1.desencriptar)(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ msg: "Username or password do not match" });
        }
        if (user.deleted_flag === 1) {
            return res.status(400).json({ msg: "Suspended account. Contact the administrator" });
        }
        const token = await (0, jsonwebtoken_1.generarJWT)(user.id);
        res.json({ user, token });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ msg: "Contact the administrator" });
    }
};
exports.login = login;
// ************************************************************************************************************************
// !                                                     VALIDACIÓN DE TOKEN
// ************************************************************************************************************************
const validacionToken = async (req, res, next) => {
    try {
        let token = req.header("Authorization");
        if (!token) {
            token = req.body.token;
            if (!token) {
                return res.status(401).json({ msg: "No hay token en la petición" });
            }
        }
        const secretKey = process.env.SECRETTOPRIVATEKEY;
        const payload = jsonwebtoken_2.default.verify(token, secretKey);
        const userAuth = await user_1.default.findByPk(payload.uid);
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
    }
    catch (e) {
        res.status(403).json({ msg: "Token no valido" });
        console.log(e);
    }
};
exports.validacionToken = validacionToken;
// ************************************************************************************************************************
// !                                                     RECUPERAR CUENTA
// ************************************************************************************************************************
const recoveryAccount = async (req, res) => {
    try {
        const email = req.body.email;
        const user = await user_1.default.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ mensaje: "Usuario no encontrado" });
        }
        else {
            const token = await (0, jsonwebtoken_1.generarJWT)(user.id);
            const transporter = nodemailer_1.default.createTransport({
                host: "smtp.office365.com",
                port: 587,
                auth: {
                    user: process.env.EMAIL_RECOVERY,
                    pass: process.env.PASSW_RECOVERY,
                },
            });
            let mailOption = await transporter.sendMail({
                from: '"Equipo Auditar" <aisense_bot@aisense.cl>',
                to: email,
                subject: "Recovery Password - SmartBoarding",
                html: `
					<h1>Sistema de recuperación de contraseñas</h1>
					<p>Usted solicito una recuperación de contraseña desde el sitio ${process.env.SITE_WEB_URL}. <br> Para recuperar su contraseña ingrese al siguiente link y genere una nueva contraseña</p>
					
					<small>${process.env.SITE_WEB_URL}/recoveryAccount/${token}</small>
					</br>
					<a href="${process.env.SITE_WEB_URL}/recoveryAccount/${token}">Recuperar contraseña</a>
					`, // html body
            });
            //TODO Ver si es que hay que colocar la url de la api o la dirección 
            transporter.sendMail(mailOption, (error, info) => {
                if (error) {
                    res.status(500).send(error.message);
                }
                else {
                    console.log("Email enviado");
                    res.status(200).json(req.body);
                }
            });
            return res.status(200).json({ mensaje: "Se envió un correo de recuperación", estado: "ok" });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
};
exports.recoveryAccount = recoveryAccount;
// ************************************************************************************************************************
// !                                                     CAMBIAR CONTRASEÑA
// ************************************************************************************************************************
const changePassword = async (req, res) => {
    try {
        const token = req.params.token;
        const password = req.body.password;
        if (!token) {
            return res.status(401).json({ msg: "No hay token en la petición" });
        }
        const secretKey = process.env.SECRETTOPRIVATEKEY;
        const payload = jsonwebtoken_2.default.verify(token, secretKey);
        const userAuth = await user_1.default.findByPk(payload.uid);
        if (!userAuth) {
            return res.status(401).json({ msg: "Token no valido" });
        }
        if (userAuth.deleted_flag == 1) {
            return res.status(401).json({ msg: "Token no valido" });
        }
        const newPassword = await (0, bcrypt_1.encriptar)(password);
        await user_1.default.update({ password: newPassword }, { where: { id: userAuth.id } });
        return res.status(200).json({ msg: "Cambio de contraseña exitoso" });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
};
exports.changePassword = changePassword;
//# sourceMappingURL=auth.js.map