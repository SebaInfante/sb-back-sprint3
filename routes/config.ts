
import { Router } from 'express'
import { check } from 'express-validator';
import { changePassword } from '../controllers/config';
import { } from '../controllers/config';
import { validarCampos } from '../middlewares/validar-campos';
import { validarJWT } from '../middlewares/validar-jwt';

const router = Router();

router.post('/change-password', [validarJWT] ,changePassword);

export default router