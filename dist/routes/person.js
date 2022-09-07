"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const multer_1 = __importDefault(require("multer"));
const storageStrategy = multer_1.default.memoryStorage();
const bstorage = (0, multer_1.default)({ storage: storageStrategy });
// const idCardStorage = multer.diskStorage()
const idCardStorage = (0, multer_1.default)({ dest: 'idCard' });
const person_1 = require("../controllers/person");
const reportes_1 = require("../controllers/reportes");
const multer_2 = __importDefault(require("../lib/multer"));
const validar_campos_1 = require("../middlewares/validar-campos");
const validar_jwt_1 = require("../middlewares/validar-jwt");
const validar_role_1 = require("../middlewares/validar-role");
const router = (0, express_1.Router)();
//TODO Obtengo primero 500 registros de las personas.
router.post("/persons", [validar_jwt_1.validarJWT], person_1.getPersons);
//TODO Obtengo primero 500 registros de las personas.
router.post("/filtrarNomina", [validar_jwt_1.validarJWT], reportes_1.filtrarNomina);
//TODO Obtengo las ocupaciones mediante el id.
router.get("/employment/:id", [validar_jwt_1.validarJWT], person_1.getEmployment);
//TODO Actualizo los datos de las personas.
router.put("/updateDatos/:id", [validar_jwt_1.validarJWT], person_1.updateDatos);
//TODO Genera y descarga la ficha de la persona.
router.get("/fichaPerson/:rut", [validar_jwt_1.validarJWT], person_1.getFichaPerson);
//TODO Obtengo los datos de una persona con su rut.
router.get("/person/:rut", [validar_jwt_1.validarJWT, (0, express_validator_1.check)("rut", "Rut is required").not().isEmpty(), validar_campos_1.validarCampos], person_1.getPerson);
//TODO Obtengo todos las ocupaciones que existen siendo admin.
router.get("/allEmployement", [validar_jwt_1.validarJWT, validar_role_1.esAdminRole], person_1.getAllEmployment);
//TODO Obtengo todos los documentos relacionados a una persona.
router.post("/documentsPerson", [validar_jwt_1.validarJWT], person_1.getDocumentsPerson);
//TODO Obtengo todos los documentos relacionados a una ocupacion.
router.post("/documents", [validar_jwt_1.validarJWT, (0, express_validator_1.check)("ocupacion", "ocupacion is required").not().isEmpty(), validar_campos_1.validarCampos], person_1.getDocuments);
//TODO Descargo un documento cargado usando el nombre de este.
router.post("/downloadDoc", person_1.downloadDoc);
//TODO Descargo un documento cargado usando el nombre de este.
router.get("/downloadFicha/:resource_url", person_1.downloadFicha);
//TODO Valida un rut si esta utilizado en una empresa.
router.post("/validarRut", [validar_jwt_1.validarJWT, (0, express_validator_1.check)("rut", "Rut is required").not().isEmpty(), validar_campos_1.validarCampos], person_1.validarRut);
//TODO Agrega una nueva persona a los registros (data y avatar).
router.post("/addPerson", [bstorage.single("file"), validar_jwt_1.validarJWT], person_1.addPerson); //Hay que validar los campos aquí
//TODO Entrega una vista previa de la foto cargada.
router.post("/photoPreview", [validar_jwt_1.validarJWT, multer_2.default.single("file")], person_1.photoPreview);
//TODO Agrega documentos usando el rut del usuario.
router.post("/docsFile", [bstorage.single("file"), validar_jwt_1.validarJWT], person_1.docsFile);
//TODO Agrega documentos usando el rut del usuario.
router.post("/IdcardFront", [validar_jwt_1.validarJWT, multer_2.default.single("file")], person_1.IdcardFront);
//TODO Elimina una persona con todos sus archivos.
router.delete("/deletePerson/:id", [validar_jwt_1.validarJWT], person_1.deletePerson);
//TODO Elimina un solo archivo usando su id.
router.delete("/deleteFile/:id", [validar_jwt_1.validarJWT], person_1.deleteFile);
//TODO Envia un email para soltar un empleado.
router.post("/sendEmailDeletePerson", [validar_jwt_1.validarJWT], person_1.sendEmailDeletePerson);
//TODO Genera un reporte excel.
router.post('/report', [validar_jwt_1.validarJWT], person_1.downloadReportRecords);
router.get('/downreport/:resource_url', person_1.downReport);
exports.default = router;
//# sourceMappingURL=person.js.map