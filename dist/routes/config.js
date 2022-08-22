"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const config_1 = require("../controllers/config");
const validar_jwt_1 = require("../middlewares/validar-jwt");
const router = (0, express_1.Router)();
router.post('/change-password', [validar_jwt_1.validarJWT], config_1.changePassword);
exports.default = router;
//# sourceMappingURL=config.js.map