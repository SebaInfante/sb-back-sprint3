"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const users_1 = require("../controllers/users");
const validar_campos_1 = require("../middlewares/validar-campos");
const validar_jwt_1 = require("../middlewares/validar-jwt");
const validar_role_1 = require("../middlewares/validar-role");
const router = (0, express_1.Router)();
router.get("/mandantes", [validar_jwt_1.validarJWT, validar_role_1.esAdminRole], users_1.getUserMandante);
router.get("/empleados", [validar_jwt_1.validarJWT, validar_role_1.esAdminRole], users_1.getUserEmpleado);
router.get("/empleadosXmandante", [validar_jwt_1.validarJWT], users_1.getUserEmpleadoPorMandanteYAdmin);
// TODO Ver las rutas que se usan.
router.post("/emploxmandanteAdmin", [validar_jwt_1.validarJWT,
    // esAdminRole,  :TODO
    // check('mandante','Mandante is required').not().isEmpty(),
    // check('mandante','Mandante is a number').isNumeric(),
    // validarCampos,
], users_1.getemploxmandanteAdmin);
router.post("/", [validar_jwt_1.validarJWT, validar_role_1.esAdminRole, (0, express_validator_1.check)("name", "Name is required").not().isEmpty(), (0, express_validator_1.check)("email", "Email is required").not().isEmpty(), (0, express_validator_1.check)("password", "Password is required").not().isEmpty(), (0, express_validator_1.check)("password", "Password is required").isLength({ min: 6 }), (0, express_validator_1.check)("role", "Role is required").not().isEmpty(), (0, express_validator_1.check)("role", "Role is not valid").isIn(["ADM", "USM", "USC"]), (0, express_validator_1.check)("email", "Email is not valid").isEmail(), validar_campos_1.validarCampos,], users_1.createUser);
router.put("/:id", [validar_jwt_1.validarJWT, validar_role_1.esAdminRole, (0, express_validator_1.check)("id", "Id is required").not().isEmpty()], users_1.updateUser);
exports.default = router;
//# sourceMappingURL=users.js.map