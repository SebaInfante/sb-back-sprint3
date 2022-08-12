
import { Router } from 'express'
import { check } from 'express-validator';
import {listDevice,addDevice,updateDevice,deleteDevice, getAllCompanyxMandante, deleteEmploment, getEmployment, getTurno, deleteTurno, getCompany, addCompany, getAllCompany, getAllMandante, getAllCompanyMandante, addTurnoEfectivo, getTurnosCompany, getAllTurnos, getAllEmployment, addEmployement, addDocument, deleteUser, getUsers, getUser, deleteCompany} from '../controllers/admin';
import { validarCampos } from '../middlewares/validar-campos';
import { validarJWT } from "../middlewares/validar-jwt";
import { esAdminRole } from '../middlewares/validar-role';
const router = Router();

//TODO Agrega una nueva compañia.
router.post("/addCompany",              [validarJWT, esAdminRole], addCompany);

//TODO Obtengo todas las compañia.
router.get("/getAllCompany",            [validarJWT, esAdminRole], getAllCompany);

//TODO Obtengo toda la informacion de una compañia.
router.get("/getCompany/:id",            [validarJWT, esAdminRole], getCompany);

//TODO Obtengo todas los mandantes.
router.get("/getAllMandante",           [validarJWT, esAdminRole], getAllMandante);

//TODO Obtengo todas las empresas por un mandante.
router.get("/getAllCompanyMandante/:id",       [validarJWT, esAdminRole], getAllCompanyMandante);

//TODO Obtengo todas las empresas por un mandante.
router.get("/getAllCompanyxMandante",       [validarJWT, esAdminRole], getAllCompanyxMandante);

//TODO Crea un nuevo turno efectivo
router.post("/addTurnoEfectivo",       [validarJWT, esAdminRole], addTurnoEfectivo);

//TODO Crea un nuevo turno efectivo
router.get("/getTurnosCompany/:id",       [validarJWT, esAdminRole], getTurnosCompany);

//TODO Obtengo todos los turnos
router.get("/getAllTurnos",       [validarJWT, esAdminRole], getAllTurnos);

//TODO Obtengo todos los turnos
router.get("/getTurno/:id",       [validarJWT, esAdminRole], getTurno);

//TODO Obtengo todos los turnos
router.get("/getEmployment/:id",       [validarJWT, esAdminRole], getEmployment);

//TODO Obtengo todos los turnos
router.get("/getAllEmployment",       [validarJWT, esAdminRole], getAllEmployment);

//TODO Agrego una nueva ocupacion
router.post( "/addEmployment", [ validarJWT, esAdminRole, check("mandante", "Mandante is required").not().isEmpty(), check("employee", "Employee is required").not().isEmpty(), check("employment", "Employment is required").not().isEmpty(), validarCampos, ], addEmployement );

//TODO Agrego un nuevo documento
router.post( "/addDocument", [ validarJWT, esAdminRole, check("id_employment", "Employment is required").not().isEmpty(), check("name", "Document is required").not().isEmpty(), validarCampos, ], addDocument );

//TODO Obtengo todos los usuarios
router.get("/getUsers", [validarJWT, esAdminRole], getUsers);

//TODO Obtengo todos los usuarios
router.get( "/getUsers/:id", [validarJWT, esAdminRole, check("id", "Id is required").not().isEmpty()], getUser );

//TODO Eliminar un usuario
router.delete( "/deleteUser/:id", [ validarJWT, esAdminRole ], deleteUser );

//TODO Eliminar una compañia
router.delete( "/deleteCompany/:id", [ validarJWT, esAdminRole ], deleteCompany );

//TODO Eliminar una compañia
router.delete( "/deleteTurno/:id", [ validarJWT, esAdminRole ], deleteTurno );

//TODO Eliminar una compañia
router.delete( "/deleteEmploment/:id", [ validarJWT, esAdminRole ], deleteEmploment );


//************* CRUD DIVICE

//TODO Listar Device
router.get( "/device", [ validarJWT, esAdminRole ], listDevice );
//TODO Agregar Device
router.post( "/device", [ validarJWT, esAdminRole ], addDevice );
//TODO Editar Device
router.post( "/device/:id", [ validarJWT, esAdminRole ], updateDevice );
//TODO Eliminar Device
router.delete( "/device/:id", [ validarJWT, esAdminRole ], deleteDevice );





export default router