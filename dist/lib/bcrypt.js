"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.desencriptar = exports.encriptar = void 0;
const bcrypt = require('bcrypt');
const encriptar = async (planePassword) => {
    return await bcrypt.hash(planePassword, 10);
};
exports.encriptar = encriptar;
const desencriptar = async (planePassword, hashPassword) => {
    return await bcrypt.compare(planePassword, hashPassword);
};
exports.desencriptar = desencriptar;
//# sourceMappingURL=bcrypt.js.map