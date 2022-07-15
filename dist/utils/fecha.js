"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDate = exports.restarDias = exports.sumarDias = void 0;
const sumarDias = (fecha, dias) => {
    fecha.setDate(fecha.getDate() + dias);
    return fecha.toISOString();
};
exports.sumarDias = sumarDias;
const restarDias = (fecha, dias) => {
    fecha.setDate(fecha.getDate() - dias);
    return fecha.toISOString();
};
exports.restarDias = restarDias;
const formatDate = (fecha) => {
    const today = fecha.toISOString().replace("T", " ");
    const caracter = today.indexOf(".");
    const resultado = today.slice(0, caracter);
    return resultado;
};
exports.formatDate = formatDate;
//# sourceMappingURL=fecha.js.map