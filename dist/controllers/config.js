"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = void 0;
const bcrypt_1 = require("../lib/bcrypt");
const jsonwebtoken_1 = require("../lib/jsonwebtoken");
const fecha_1 = require("../utils/fecha");
const user_1 = __importDefault(require("../models/user"));
const changePassword = async (req, res) => {
    const fecha = new Date();
    const { password, newPassword, userAuth } = req.body;
    const validPassword = await (0, bcrypt_1.desencriptar)(password, userAuth.password);
    if (validPassword) {
        try {
            const updatePass = {
                password: await (0, bcrypt_1.encriptar)(newPassword),
                update_time: (0, fecha_1.formatDate)(fecha),
                update_user: userAuth.name,
            };
            await user_1.default.update(updatePass, { where: { id: userAuth.id } });
            const token = await (0, jsonwebtoken_1.generarJWT)(userAuth.id);
            res.status(200).json({ updatePass, token });
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ msg: "Contact the administrator" });
        }
    }
    else {
        res.status(500).json({ msg: "Contraseña actual ingresada no es correcta" });
    }
};
exports.changePassword = changePassword;
//# sourceMappingURL=config.js.map