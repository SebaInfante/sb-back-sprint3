"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const admin_1 = require("../controllers/admin");
const validar_campos_1 = require("../middlewares/validar-campos");
const validar_jwt_1 = require("../middlewares/validar-jwt");
const validar_role_1 = require("../middlewares/validar-role");
const router = (0, express_1.Router)();
//TODO Agrega una nueva compañia.
router.post("/addCompany", [validar_jwt_1.validarJWT, validar_role_1.esAdminRole], admin_1.addCompany);
//TODO Obtengo todas las compañia.
router.get("/getAllCompany", [validar_jwt_1.validarJWT, validar_role_1.esAdminRole], admin_1.getAllCompany);
//TODO Obtengo toda la informacion de una compañia.
router.get("/getCompany/:id", [validar_jwt_1.validarJWT, validar_role_1.esAdminRole], admin_1.getCompany);
//TODO Obtengo todas los mandantes.
router.get("/getAllMandante", [validar_jwt_1.validarJWT, validar_role_1.esAdminRole], admin_1.getAllMandante);
//TODO Obtengo todas las empresas por un mandante.
router.get("/getAllCompanyMandante/:id", [validar_jwt_1.validarJWT, validar_role_1.esAdminRole], admin_1.getAllCompanyMandante);
//TODO Obtengo todas las empresas por un mandante.
router.get("/getAllCompanyxMandante", [validar_jwt_1.validarJWT, validar_role_1.esAdminRole], admin_1.getAllCompanyxMandante);
//TODO Crea un nuevo turno efectivo
router.post("/addTurnoEfectivo", [validar_jwt_1.validarJWT, validar_role_1.esAdminRole], admin_1.addTurnoEfectivo);
//TODO Crea un nuevo turno efectivo
router.get("/getTurnosCompany/:id", [validar_jwt_1.validarJWT, validar_role_1.esAdminRole], admin_1.getTurnosCompany);
//TODO Obtengo todos los turnos
router.get("/getAllTurnos", [validar_jwt_1.validarJWT, validar_role_1.esAdminRole], admin_1.getAllTurnos);
//TODO Obtengo todos los turnos
router.get("/getTurno/:id", [validar_jwt_1.validarJWT, validar_role_1.esAdminRole], admin_1.getTurno);
//TODO Obtengo todos los turnos
router.get("/getEmployment/:id", [validar_jwt_1.validarJWT, validar_role_1.esAdminRole], admin_1.getEmployment);
//TODO Obtengo todos los turnos
router.get("/getAllEmployment", [validar_jwt_1.validarJWT, validar_role_1.esAdminRole], admin_1.getAllEmployment);
//TODO Agrego una nueva ocupacion
router.post("/addEmployment", [validar_jwt_1.validarJWT, validar_role_1.esAdminRole, (0, express_validator_1.check)("mandante", "Mandante is required").not().isEmpty(), (0, express_validator_1.check)("employee", "Employee is required").not().isEmpty(), (0, express_validator_1.check)("employment", "Employment is required").not().isEmpty(), validar_campos_1.validarCampos,], admin_1.addEmployement);
//TODO Agrego un nuevo documento
router.post("/addDocument", [validar_jwt_1.validarJWT, validar_role_1.esAdminRole, (0, express_validator_1.check)("id_employment", "Employment is required").not().isEmpty(), (0, express_validator_1.check)("name", "Document is required").not().isEmpty(), validar_campos_1.validarCampos,], admin_1.addDocument);
//TODO Obtengo todos los usuarios
router.get("/getUsers", [validar_jwt_1.validarJWT, validar_role_1.esAdminRole], admin_1.getUsers);
//TODO Obtengo todos los usuarios
router.get("/getUsers/:id", [validar_jwt_1.validarJWT, validar_role_1.esAdminRole, (0, express_validator_1.check)("id", "Id is required").not().isEmpty()], admin_1.getUser);
//TODO Eliminar un usuario
router.delete("/deleteUser/:id", [validar_jwt_1.validarJWT, validar_role_1.esAdminRole], admin_1.deleteUser);
//TODO Eliminar una compañia
router.delete("/deleteCompany/:id", [validar_jwt_1.validarJWT, validar_role_1.esAdminRole], admin_1.deleteCompany);
//TODO Eliminar una compañia
router.delete("/deleteTurno/:id", [validar_jwt_1.validarJWT, validar_role_1.esAdminRole], admin_1.deleteTurno);
//TODO Eliminar una compañia
router.delete("/deleteEmploment/:id", [validar_jwt_1.validarJWT, validar_role_1.esAdminRole], admin_1.deleteEmploment);
exports.default = router;
//# sourceMappingURL=admin.js.map