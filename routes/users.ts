import { Router } from "express";
import { check } from "express-validator";
import {
  createUser,
  getemploxmandanteAdmin,
  getUserEmpleado,
  getUserEmpleadoPorMandanteYAdmin,
  getUserMandante,
  updateUser
} from "../controllers/users";

import { validarCampos } from "../middlewares/validar-campos";
import { validarJWT } from "../middlewares/validar-jwt";
import {
  esAdminMandanteRole,
  esAdminRole,
  esMandanteRole,
} from "../middlewares/validar-role";

const router = Router();
router.get("/mandantes", [validarJWT, esAdminRole], getUserMandante);

router.get("/empleados", [validarJWT, esAdminRole], getUserEmpleado);

router.get("/empleadosXmandante",[validarJWT],getUserEmpleadoPorMandanteYAdmin);

// TODO Ver las rutas que se usan.
router.post("/emploxmandanteAdmin",[validarJWT,
	// esAdminRole,  :TODO
	// check('mandante','Mandante is required').not().isEmpty(),
	// check('mandante','Mandante is a number').isNumeric(),
	// validarCampos,
],getemploxmandanteAdmin);

router.post( "/", [ validarJWT, esAdminRole, check("name", "Name is required").not().isEmpty(), check("email", "Email is required").not().isEmpty(), check("password", "Password is required").not().isEmpty(), check("password", "Password is required").isLength({ min: 6 }), check("role", "Role is required").not().isEmpty(), check("role", "Role is not valid").isIn(["ADM", "USM", "USC"]), check("email", "Email is not valid").isEmail(), validarCampos, ], createUser );

router.put( "/:id", [validarJWT, esAdminRole, check("id", "Id is required").not().isEmpty()], updateUser );


export default router;
