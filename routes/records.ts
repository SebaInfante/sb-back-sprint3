
import { Router } from 'express'

import { check } from 'express-validator';
import { validarCampos } from '../middlewares/validar-campos';
import { validarJWT } from '../middlewares/validar-jwt';

import {downloadReportCalculoHora, downloadReportAsistencia, downloadReportRecords, recordsToDay, downReport ,deleteRecord, updateRecord, downloadReportNomina} from '../controllers/records';
import { esAdminRole } from '../middlewares/validar-role';

const router = Router();


router.post('/',[validarJWT], recordsToDay);
router.post('/report',[validarJWT] ,downloadReportRecords);
router.post('/reportNomina',[validarJWT] ,downloadReportNomina);
router.post('/reportAsistencia',[validarJWT] ,downloadReportAsistencia);
router.post('/downloadReportCalculoHora',[validarJWT] ,downloadReportCalculoHora);
router.get('/downreport/:resource_url', downReport);

router.put('/editarPasada/:id', [validarJWT, esAdminRole], updateRecord);
router.delete("/deleteRecord/:id", [validarJWT, esAdminRole], deleteRecord);

export default router