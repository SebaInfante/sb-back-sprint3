import { Router } from "express";
import { check } from "express-validator";
import multer from "multer";

const storageStrategy = multer.memoryStorage()
const bstorage = multer({storage:storageStrategy})
// const idCardStorage = multer.diskStorage()
const idCardStorage = multer({ dest: 'idCard'})
import {
    getPersons,
    addPerson,
    getEmployment,
    getDocuments,
    validarRut,
    photoPreview,
    docsFile,
    getAllEmployment,
    deletePerson,
    getPerson,
    getDocumentsPerson,
    downloadDoc,
    updateDatos,
    deleteFile,
    sendEmailDeletePerson,
    downloadReportRecords,
    downReport,
    getFichaPerson,
    downloadFicha,
    IdcardBack,
    IdcardFront
} from "../controllers/person";
import  storage  from "../lib/multer";

import { validarCampos } from "../middlewares/validar-campos";
import { validarJWT } from "../middlewares/validar-jwt";
import { esAdminRole } from "../middlewares/validar-role";

const router = Router();

//TODO Obtengo primero 500 registros de las personas.
router.post("/persons",           [validarJWT], getPersons);

//TODO Obtengo las ocupaciones mediante el id.
router.get("/employment/:id",     [validarJWT], getEmployment);

//TODO Actualizo los datos de las personas.
router.put("/updateDatos/:id",    [validarJWT],   updateDatos);

//TODO Genera y descarga la ficha de la persona.
router.get("/fichaPerson/:rut",   [validarJWT], getFichaPerson);

//TODO Obtengo los datos de una persona con su rut.
router.get("/person/:rut",        [validarJWT,check("rut", "Rut is required").not().isEmpty(), validarCampos], getPerson); 

//TODO Obtengo todos las ocupaciones que existen siendo admin.
router.get("/allEmployement",     [validarJWT, esAdminRole], getAllEmployment);

//TODO Obtengo todos los documentos relacionados a una persona.
router.post("/documentsPerson",   [validarJWT], getDocumentsPerson);

//TODO Obtengo todos los documentos relacionados a una ocupacion.
router.post("/documents",         [validarJWT,check("ocupacion", "ocupacion is required").not().isEmpty(), validarCampos], getDocuments);

//TODO Descargo un documento cargado usando el nombre de este.
router.get("/downloadDoc/:resource_url",     downloadDoc);

//TODO Descargo un documento cargado usando el nombre de este.
router.get("/downloadFicha/:resource_url",     downloadFicha);

//TODO Valida un rut si esta utilizado en una empresa.
router.post("/validarRut",        [validarJWT, check("rut", "Rut is required").not().isEmpty(), validarCampos], validarRut);

//TODO Agrega una nueva persona a los registros (data y avatar).
router.post("/addPerson",         [ bstorage.single("file"), validarJWT], addPerson); //Hay que validar los campos aquí

//TODO Entrega una vista previa de la foto cargada.
router.post("/photoPreview",      [validarJWT, storage.single("file")], photoPreview);

//TODO Agrega documentos usando el rut del usuario.
router.post("/docsFile",          [ storage.single("file"), validarJWT], docsFile);

//TODO Agrega documentos usando el rut del usuario.
router.post("/IdcardBack",        [ storage.single("file"), validarJWT], IdcardBack);

//TODO Agrega documentos usando el rut del usuario.
router.post("/IdcardFront",        [validarJWT ,storage.single("file")], IdcardFront);

//TODO Elimina una persona con todos sus archivos.
router.delete("/deletePerson/:id", [validarJWT], deletePerson);

//TODO Elimina un solo archivo usando su id.
router.delete("/deleteFile/:id", [validarJWT], deleteFile);

//TODO Envia un email para soltar un empleado.
router.post("/sendEmailDeletePerson", [validarJWT], sendEmailDeletePerson);

//TODO Genera un reporte excel.
router.post('/report', [validarJWT], downloadReportRecords);


router.get('/downreport/:resource_url', downReport);

export default router;
