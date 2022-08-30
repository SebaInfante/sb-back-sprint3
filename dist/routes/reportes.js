"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validar_jwt_1 = require("../middlewares/validar-jwt");
const reportes_1 = require("../controllers/reportes");
const router = (0, express_1.Router)();
router.post('/asistencia', [validar_jwt_1.validarJWT], reportes_1.asistencia);
router.post('/filtrarAsistencia', [validar_jwt_1.validarJWT], reportes_1.filtrarAsistencia);
router.post('/calculoHora', [validar_jwt_1.validarJWT], reportes_1.calculoHora);
exports.default = router;
//# sourceMappingURL=reportes.js.map