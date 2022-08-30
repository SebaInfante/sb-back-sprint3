import { Router } from 'express'

import { check } from 'express-validator';
import { validarCampos } from '../middlewares/validar-campos';
import { validarJWT } from '../middlewares/validar-jwt';

import { asistencia, calculoHora, filtrarAsistencia } from '../controllers/reportes';
const router = Router();


router.post('/asistencia',[validarJWT], asistencia);
router.post('/filtrarAsistencia',[validarJWT], filtrarAsistencia);
router.post('/calculoHora',[validarJWT], calculoHora);

export default router