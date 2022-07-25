"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validarJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = __importDefault(require("../models/user"));
const validarJWT = async (req, res, next) => {
    try {
        const token = req.header("Authorization");
        const secretKey = process.env.SECRETTOPRIVATEKEY;
        if (!token) {
            return res.status(401).json({ msg: "😪No hay token en la petición" });
        }
        const payload = jsonwebtoken_1.default.verify(token, secretKey);
        const userAuth = await user_1.default.findByPk(payload.uid);
        if (!userAuth) {
            return res.status(401).json({ msg: 'Token no valido' });
        }
        if (userAuth.deleted_flag == 1) {
            return res.status(401).json({ msg: 'Token no valido' });
        }
        req.body.userAuth = userAuth;
        next();
    }
    catch (error) {
        res.status(401).json({ msg: "Token no valido" });
        console.log(error);
    }
};
exports.validarJWT = validarJWT;
//# sourceMappingURL=validar-jwt.js.map