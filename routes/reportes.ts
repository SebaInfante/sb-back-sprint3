import { Router } from 'express'

import { check } from 'express-validator';
import { validarCampos } from '../middlewares/validar-campos';
import { validarJWT } from '../middlewares/validar-jwt';

import { asistencia } from '../controllers/reportes';
const router = Router();


router.post('/asistencia',[validarJWT], asistencia);

export default router