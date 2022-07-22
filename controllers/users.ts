import { Response, Request } from "express";
import { encriptar } from "../lib/bcrypt";
import { formatDate } from "../utils/fecha";
import User from "../models/user";

const fecha = new Date();



// ************************************************************************************************************************
// !                                              VER USUARIO MANDANTE
// ************************************************************************************************************************
export const getUserMandante = async (req: Request, res: Response) => {
	try{
		const users = await User.findAll({ where: { role: "USM" } });
		res.json(users);
	} catch (error) {
		console.log(error);
		res.status(500).json({ msg: "Contact the administrator" });
	}
};

// ************************************************************************************************************************
// !                                              VER USUARIO EMPLEADO
// ************************************************************************************************************************
export const getUserEmpleado = async (req: Request, res: Response) => {
	try {
		const users = await User.findAll({ where: { role: "USC" } });
		res.json(users);
	} catch (error) {
		console.log(error);
		res.status(500).json({ msg: "Contact the administrator" });
	}
};

// ************************************************************************************************************************
// !                                              VER USUARIO EMPLEADO POR MANDANTE
// ************************************************************************************************************************
export const getUserEmpleadoPorMandanteYAdmin = async ( req: Request, res: Response ) => {
	try {
		const userAuth = req.body.userAuth;
		let users;
		if (userAuth.role === "USM") {
			users = await User.findAll({where: { role: "USC", employee: userAuth.id }});
		} else {
			users = await User.findAll({ where: { role: "USC" } });
		}
	
		res.json(users);
	} catch (error) {
		console.log(error);
		res.status(500).json({ msg: "Contact the administrator" });
	}
};

// ************************************************************************************************************************
// !                                              VER USUARIO EMPLEADO POR MANDANTE
// ************************************************************************************************************************
export const getemploxmandanteAdmin = async (req: Request, res: Response) => {
	try {
		const mandante = req.body.mandante;
		const users = await User.findAll({ where: { role: "USC", employee: mandante } });
		res.json(users);
	} catch (error) {
		console.log(error);
		res.status(500).json({ msg: "Contact the administrator" });
	}
};



// ************************************************************************************************************************
// !                                              CREAR UN NUEVO USUARIO
// ************************************************************************************************************************
export const createUser = async (req: Request, res: Response) => {
	try {
		const { name, email, password, role, employee = null, userAuth } = req.body;
		const existsEmail = await User.findOne({ where: { email } }); //Buscar si existe un email
		if (existsEmail) { return res.status(401).json({ msg: "Email already used" })}
		
		const hashPassword = await encriptar(password);
		const newUser = {
			name,
			email,
			password: hashPassword,
			role,
			employee,
			create_user : userAuth.name
		};
		const user = User.build(newUser);
		await user.save(); 
		res.json(user);
	} catch (error) {
		console.log(error);
		res.status(500).json({ msg: "Contact the administrator" });
}
};



// ************************************************************************************************************************
// !                                              ACTUALIZAR UN USUARIO
// ************************************************************************************************************************
export const updateUser = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const { email, userAuth } = req.body;

		const user = await User.findByPk(id);
		
		if (!user) {
			return res.status(404).json({ msg: "User not found" });
		}
		if (email) {
			const existsEmail = await User.findOne({ where: { email } });
			if (existsEmail) {
				return res.status(400).json({ msg: "Email already used" });
			}
		}
		const data = {
			email, 
			update_time : formatDate(fecha),
			update_user : userAuth.name
		}

		await user.update(data);
		res.json(user);
	} catch (error) {
		console.log(error);
		res.status(500).json({ msg: "Contact the administrator" });
	}
};
