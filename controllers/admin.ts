import { Response, Request } from "express";
import { encriptar } from "../lib/bcrypt";
import { formatDate } from "../utils/fecha";
import Document from "../models/Document";
import Employment from "../models/Employment";
import User from "../models/user";
import Company from "../models/Company";
import Shift_Config from "../models/Shift_Config";
const { Op,fn, sequelize , Sequelize } = require("sequelize");


const fecha = new Date();

export const addCompany = async (req: Request, res: Response) => {
	try {
		const { name, rut, role,razon, contacto, mandante = null, email = null, fono = null, userAuth } = req.body;

        const newCompany = {
            contacto,
            razon,
            name,
			rut,
			role,
			mandante,
			email,
			fono,
			create_user : userAuth.name
		};
		const company = Company.build(newCompany);
		await company.save(); 
		res.json(company);
	} catch (error) {
		console.log(error);
		res.status(500).json({ msg: "Contact the administrator" });
    }
    
}

export const getAllCompany = async (req: Request, res: Response) => {
    try{
        const company = await Company.findAll({where:{deleted_flag:0}});
        res.json(company);
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
}

export const getCompany = async (req: Request, res: Response) => {
    try{
        const id = req.params.id;
        const company = await Company.findOne({where:{id}});
        res.json(company);
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
}
export const getTurno = async (req: Request, res: Response) => {
    try{
        const id = req.params.id;
        const shift = await Shift_Config.findOne({where:{id}});
        res.json(shift);
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
}

export const getEmployment = async (req: Request, res: Response) => {
    try{
        const id = req.params.id;
        const employment = await Employment.findOne({where:{id}});
        const document = await Document.findAll({where:{employment_id:id}});
        res.json({employment,document});
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
}

export const getAllMandante = async (req: Request, res: Response) => {
    try{
        const company = await Company.findAll({ where: { role: "USM" } });
        res.json(company);
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
}

export const getAllCompanyMandante = async (req: Request, res: Response) => {
    try{
        const mandante = req.params.id;
        const company = await Company.findAll({ where: { [Op.and]:[{role: "USC"},{mandante},{deleted_flag:0}] } });
        res.json(company);
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
}

export const getAllCompanyxMandante = async (req: Request, res: Response) => {
    try{
        const userAuth = req.body.userAuth
        const company = await Company.findAll({ where: { [Op.and]:[{role: "USC"},{mandante:userAuth.id},{deleted_flag:0}] } });
        res.json(company);
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
}

export const addTurnoEfectivo = async (req: Request, res: Response) => {
	try {
		const {type, company,name, start_time, end_time, start_early, start_late, end_early, end_late, initial_date, final_date, remark='', userAuth } = req.body;
        console.log("🚀 ~ file: admin.ts ~ line 84 ~ addTurnoEfectivo ~ type", type)
        const employer = await Company.findOne({where:{[Op.and]:[{id:company},{deleted_flag:0}]}})
        let tipo:any
        if (type) {
            tipo='Diurno'
        }else{
            tipo='Nocturno'
        }

        const newShift = {
            group_id:employer.id,
            group_name:employer.name,
            shift_name:name,
            start_time,
            end_time,
            type:tipo,
            start_early,
            start_late,
            end_early,
            end_late,
            initial_date,
            final_date,
            remark,
            create_user: userAuth.name
        }

        const shift_config = Shift_Config.build(newShift);
		await shift_config.save(); 
		res.json(shift_config);
	} catch (error) {
		console.log(error);
		res.status(500).json({ msg: "Contact the administrator" });
    }
}

export const getAllTurnos = async (req: Request, res: Response) => {
    try{
        const shift_config = await Shift_Config.findAll({ where: {deleted_flag:0} });
        res.json(shift_config);
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
}

export const getTurnosCompany = async (req: Request, res: Response) => {
    try{
        const id = req.params.id
        const shift_config = await Shift_Config.findAll({ where: {[Op.and]:[{group_id:id},{deleted_flag:0}]} });
        res.json(shift_config);
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
}

export const getAllEmployment = async (req: Request, res: Response) => {
    try{
        const employment = await Employment.findAll({ where: {deleted_flag:0} });
        const document = await Document.findAll({ where: {deleted_flag:0} });
        let newOcupacion :any[]= []

        employment.map(ocupacion => {
                let n_documento = 0
                document.forEach((documento:any)=>{if(documento.employment_id==ocupacion.id) n_documento++})
                newOcupacion.push({
                    ...ocupacion.dataValues,
                    n_documento
                }) 
        })
        res.json(newOcupacion);
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
}


// ************************************************************************************************************************
// !                                              CREAR UN NUEVA OCUPACION
// ************************************************************************************************************************
export const addEmployement = async (req: Request, res: Response) => {
	try {
		const { mandante, employee, employment, userAuth } = req.body;
        console.log("🚀 ~ file: admin.ts ~ line 148 ~ addEmployement ~ employee", employee)
		// const employeeItem = await Company.findOne({ where: { id: employee } });
		const newEmployement = {
			mandante,
			employee: employee,
			name:employment,
			create_user: userAuth.name
		};
		console.log("🚀 ~ file: users.ts ~ line 137 ~ createEmployement ~ newEmployement", newEmployement)
		const employmentItem = Employment.build(newEmployement);
		await employmentItem.save();
		res.json(employmentItem);
	} catch (error) {
		console.log(error);
		res.status(500).json({ msg: "Contact the administrator" });
	}
};
// ************************************************************************************************************************
// !                                              CREAR UN NUEVO DOCUMENTO
// ************************************************************************************************************************
export const addDocument = async (req: Request, res: Response) => {
	try {
		const { id_employment, name, require, userAuth } = req.body;
        
		const newDocument = {
			employment_id : id_employment,
			name,
            require,
			create_user: userAuth.name
		};
		const DocumentM = Document.build(newDocument);
		await DocumentM.save();
		res.json(DocumentM);
	} catch (error) {
		console.log(error);
		res.status(500).json({ msg: "Contact the administrator" });
	}
};


// ************************************************************************************************************************
// !                                              ELIMINAR UN USUARIO
// ************************************************************************************************************************
export const deleteUser = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const { userAuth } = req.body;
		const user = await User.findByPk(id);
		if (!user) {
			return res.status(404).json({ msg: "User not found" });
		}

		const data = {
			deleted_flag: 1, 
			update_time : formatDate(fecha),
			update_user : userAuth.name
		}
        console.log("🚀 ~ file: admin.ts ~ line 212 ~ deleteUser ~ data", data)
		await user.update(data); // Eliminación Logica   //await user.destroy(); Eliminación Fisica
		res.json(user);
	} catch (error) {
		console.log(error);
		res.status(500).json({ msg: "Contact the administrator" });
	}
};
// ************************************************************************************************************************
// !                                              ELIMINAR UNA COMPAÑIA
// ************************************************************************************************************************
export const deleteCompany = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const { userAuth } = req.body;
		const company = await Company.findByPk(id);
		if (!company) {return res.status(404).json({ msg: "Company not found" })}

		const data = {
			deleted_flag: 1, 
			update_time : formatDate(fecha),
			update_user : userAuth.name
		}

		await company.update(data); // Eliminación Logica   //await user.destroy(); Eliminación Fisica
		res.json(company);
	} catch (error) {
		console.log(error);
		res.status(500).json({ msg: "Contact the administrator" });
	}
};
// ************************************************************************************************************************
// !                                              ELIMINAR UN TURNO
// ************************************************************************************************************************
export const deleteTurno = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const { userAuth } = req.body;
		const shift = await Shift_Config.findByPk(id);
		if (!shift) {return res.status(404).json({ msg: "Shift not found" })}

		const data = {
			deleted_flag: 1, 
			update_time : formatDate(fecha),
			update_user : userAuth.name
		}

		await shift.update(data); // Eliminación Logica   //await user.destroy(); Eliminación Fisica
		res.json(shift);
	} catch (error) {
		console.log(error);
		res.status(500).json({ msg: "Contact the administrator" });
	}
};
// ************************************************************************************************************************
// !                                              ELIMINAR UNA OCUPACION
// ************************************************************************************************************************
export const deleteEmploment = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const { userAuth } = req.body;
		const employment = await Employment.findByPk(id);
		if (!employment) {return res.status(404).json({ msg: "Shift not found" })}

		const data = {
			deleted_flag: 1, 
			update_time : formatDate(fecha),
			update_user : userAuth.name
		}

		await employment.update(data); // Eliminación Logica   //await user.destroy(); Eliminación Fisica
		res.json(employment);
	} catch (error) {
		console.log(error);
		res.status(500).json({ msg: "Contact the administrator" });
	}
};

// ************************************************************************************************************************
// !                                              VER TODOS LOS USUARIOS
// ************************************************************************************************************************
export const getUsers = async (req: Request, res: Response) => {
	try{
		const users = await User.findAll({where:{deleted_flag:0}});
		res.json(users);
	} catch (error) {
		console.log(error);
		res.status(500).json({ msg: "Contact the administrator" });
	}
};
// ************************************************************************************************************************
// !                                              VER SOLO UN USUARIO
// ************************************************************************************************************************
export const getUser = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const user = await User.findByPk(id);
		user
			? res.json(user)
			: res.status(404).json({ msg: `User with id ${id} not found` });
	} catch (error) {
		console.log(error);
		res.status(500).json({ msg: "Contact the administrator" });
	}
};