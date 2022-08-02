"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_1 = require("../controllers/dashboard");
const validar_jwt_1 = require("../middlewares/validar-jwt");
const router = (0, express_1.Router)();
//TODO Agrega una nueva compañia.
// router.post("/addCompany",              [validarJWT, esAdminRole], addCompany);
router.get('/pasadasDash', [validar_jwt_1.validarJWT], dashboard_1.pasadasDash);
router.post('/turnosDash', [validar_jwt_1.validarJWT], dashboard_1.turnosDash);
router.get('/entradasSalidasDiarias', [validar_jwt_1.validarJWT], dashboard_1.entradasSalidasDiarias);
router.get('/asistenciaDiarias', [validar_jwt_1.validarJWT], dashboard_1.asistenciaDiarias);
exports.default = router;
//# sourceMappingURL=dashboard.js.map