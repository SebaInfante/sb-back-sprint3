"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield user_1.default.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ msg: "Username or password do not match" });
        }
        const validPassword = yield (0, bcrypt_1.desencriptar)(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ msg: "Username or password do not match" });
        }
        if (user.deleted_flag === 1) {
            return res.status(400).json({ msg: "Suspended account. Contact the administrator" });
        }
        const token = yield (0, jsonwebtoken_1.generarJWT)(user.id);
        res.json({ user, token });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ msg: "Contact the administrator" });
    }
});
exports.login = login;
// ************************************************************************************************************************
// !                                                     VALIDACI??N DE TOKEN
// ************************************************************************************************************************
const validacionToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let token = req.header("Authorization");
        if (!token) {
            token = req.body.token;
            if (!token) {
                return res.status(401).json({ msg: "No hay token en la petici??n" });
            }
        }
        const secretKey = process.env.SECRETTOPRIVATEKEY;
        const payload = jsonwebtoken_2.default.verify(token, secretKey);
        const userAuth = yield user_1.default.findByPk(payload.uid);
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
});
exports.validacionToken = validacionToken;
// ************************************************************************************************************************
// !                                                     RECUPERAR CUENTA
// ************************************************************************************************************************
const recoveryAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const email = req.body.email;
        const user = yield user_1.default.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ mensaje: "Usuario no encontrado" });
        }
        else {
            const token = yield (0, jsonwebtoken_1.generarJWT)(user.id);
            const transporter = nodemailer_1.default.createTransport({
                host: "smtp.office365.com",
                port: 587,
                auth: {
                    user: process.env.EMAIL_RECOVERY,
                    pass: process.env.PASSW_RECOVERY,
                },
            });
            let mailOption = yield transporter.sendMail({
                from: '"Equipo Auditar" <aisense_bot@aisense.cl>',
                to: email,
                subject: "Recovery Password - SmartBoarding",
                html: `
					<h1>Sistema de recuperaci??n de contrase??as</h1>
					<p>Usted solicito una recuperaci??n de contrase??a desde el sitio ${process.env.SITE_WEB_URL}. <br> Para recuperar su contrase??a ingrese al siguiente link y genere una nueva contrase??a</p>
					
					<small>${process.env.SITE_WEB_URL}/recoveryAccount/${token}</small>
					</br>
					<a href="${process.env.SITE_WEB_URL}/recoveryAccount/${token}">Recuperar contrase??a</a>
					`, // html body
            });
            //TODO Ver si es que hay que colocar la url de la api o la direcci??n 
            transporter.sendMail(mailOption, (error, info) => {
                if (error) {
                    res.status(500).send(error.message);
                }
                else {
                    console.log("Email enviado");
                    res.status(200).json(req.body);
                }
            });
            return res.status(200).json({ mensaje: "Se envi?? un correo de recuperaci??n", estado: "ok" });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
});
exports.recoveryAccount = recoveryAccount;
// ************************************************************************************************************************
// !                                                     CAMBIAR CONTRASE??A
// ************************************************************************************************************************
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.params.token;
        const password = req.body.password;
        if (!token) {
            return res.status(401).json({ msg: "No hay token en la petici??n" });
        }
        const secretKey = process.env.SECRETTOPRIVATEKEY;
        const payload = jsonwebtoken_2.default.verify(token, secretKey);
        const userAuth = yield user_1.default.findByPk(payload.uid);
        if (!userAuth) {
            return res.status(401).json({ msg: "Token no valido" });
        }
        if (userAuth.deleted_flag == 1) {
            return res.status(401).json({ msg: "Token no valido" });
        }
        const newPassword = yield (0, bcrypt_1.encriptar)(password);
        yield user_1.default.update({ password: newPassword }, { where: { id: userAuth.id } });
        return res.status(200).json({ msg: "Cambio de contrase??a exitoso" });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
});
exports.changePassword = changePassword;
//# sourceMappingURL=auth.js.map