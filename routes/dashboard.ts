import { Router } from 'express'
import { check } from 'express-validator';
import { turnosDash, asistenciaDiarias, entradasSalidasDiarias, pasadasDash } from '../controllers/dashboard';
import { validarCampos } from '../middlewares/validar-campos';
import { validarJWT } from "../middlewares/validar-jwt";
import { esAdminRole } from '../middlewares/validar-role';

const router = Router();

//TODO Agrega una nueva compañia.
// router.post("/addCompany",              [validarJWT, esAdminRole], addCompany);
router.get('/pasadasDash', [validarJWT], pasadasDash)
router.post('/turnosDash', [validarJWT], turnosDash)
router.get('/entradasSalidasDiarias', [validarJWT], entradasSalidasDiarias)
router.get('/asistenciaDiarias', [validarJWT], asistenciaDiarias)

export default router