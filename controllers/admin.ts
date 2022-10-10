import { Response, Request } from "express";
import { formatDate } from "../utils/fecha";
import Document from "../models/Document";
import Employment from "../models/Employment";
import User from "../models/user";
import Company from "../models/Company";
import Shift_Config from "../models/Shift_Config";
import Device from "../models/Device";
const { Op } = require("sequelize");

const fecha = new Date();


// ************************************************************************************************************************
// !                                              AGREGAR UNA COMPAÑIA
// ************************************************************************************************************************
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



// ************************************************************************************************************************
// !                                              OBTENGO TODAS LAS COMPAÑIAS
// ************************************************************************************************************************
export const getAllCompany = async (req: Request, res: Response) => {
    try{
        const company = await Company.findAll({where:{deleted_flag:0}});
        res.json(company);
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
}



// ************************************************************************************************************************
// !                                              OBTENGO UNA COMPAÑIA POR UN ID DE EMPRESA
// ************************************************************************************************************************
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



// ************************************************************************************************************************
// !                                              OBTENGO LOS TURNOS POR UN ID DE EMPRESA
// ************************************************************************************************************************
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



// ************************************************************************************************************************
// !                                              OBTENGO UNA OCUPACION POR UN ID DE EMPRESA
// ************************************************************************************************************************
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



// ************************************************************************************************************************
// !                                              OBTENGO TODOS LOS MANDANTES
// ************************************************************************************************************************
export const getAllMandante = async (req: Request, res: Response) => {
    try{
        const company = await Company.findAll({ where: { role: "USM" } });
        res.json(company);
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
}



// ************************************************************************************************************************
// !                                              OBTENGO TODAS LAS COMPAÑIAS POR UN MANDANTE
// ************************************************************************************************************************
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



// ************************************************************************************************************************
// !                                              OBTENGO TODAS LAS COMPAÑIAS POR UN MANDANTE
// ************************************************************************************************************************
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



// ************************************************************************************************************************
// !                                              AGREGO UN NUEVO TURNO EFECTIVO
// ************************************************************************************************************************
export const addTurnoEfectivo = async (req: Request, res: Response) => {
	try {
		const { type, lunes, martes, miercoles, jueves, viernes, sabado, domingo, company,name, start_time, end_time, start_early, start_late, end_early, end_late, initial_date, final_date, remark='', userAuth } = req.body;
        const employer = await Company.findOne({where:{[Op.and]:[{id:company},{deleted_flag:0}]}})
        let tipo:any
		type ? tipo='Diurno' : tipo='Nocturno'

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
			lunes,
			martes,
			miercoles,
			jueves,
			viernes,
			sabado,
			domingo,
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



// ************************************************************************************************************************
// !                                              OBTENGO TODO LOS TURNOS
// ************************************************************************************************************************

export const getAllTurnos = async (req: Request, res: Response) => {
    try{
        const shift_config = await Shift_Config.findAll({ where: {deleted_flag:0} });
        res.json(shift_config);
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
}


// ************************************************************************************************************************
// !                                              OBTENGO LOS TURNOS DE UNA COMPAÑIA USANDO SU ID
// ************************************************************************************************************************
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



// ************************************************************************************************************************
// !                                              OBTENGO TODAS LAS OCUPACIONES 
// ************************************************************************************************************************
export const getAllEmployment = async (req: Request, res: Response) => {
    try{
        const employment = await Employment.findAll({ where: {deleted_flag:0} });
        const document = await Document.findAll({ where: {deleted_flag:0} });
        let newOcupacion:any[] = []

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
// !                                              AGREGA UNA NUEVA OCUPACION
// ************************************************************************************************************************
export const addEmployement = async (req: Request, res: Response) => {
	try {
		const { mandante, employee, employment, userAuth } = req.body;
		const newEmployement = {
			mandante,
			employee: employee,
			name:employment,
			create_user: userAuth.name
		};

		const employmentItem = Employment.build(newEmployement);
		await employmentItem.save();
		res.json(employmentItem);
	} catch (error) {
		console.log(error);
		res.status(500).json({ msg: "Contact the administrator" });
	}
};



// ************************************************************************************************************************
// !                                              AGREGA UN NUEVO DOCUMENTO
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
		const documentItem = Document.build(newDocument);
		await documentItem.save();
		res.json(documentItem);
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
		if (!user) { return res.status(404).json({ msg: "User not found" }) }

		const data = {
			deleted_flag: 1, 
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

		await company.update(data); 
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

		await shift.update(data);
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

		await employment.update(data);
		res.json(employment);
	} catch (error) {
		console.log(error);
		res.status(500).json({ msg: "Contact the administrator" });
	}
};




// ************************************************************************************************************************
// !                                              OBTENGO TODOS LOS USUARIOS
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
// !                                              OBTENGO SOLO UN USUARIO USANDO UN ID
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








export const listDevice = async (req: Request, res: Response) => {
	try {
		const device = await Device.findAll({where:{deleted_flag : 0}});
		res.status(200).json(device)
	} catch (error) {
		console.log(error);
		res.status(500).json({ msg: "Contact the administrator" });
	}
};

export const getDevice = async (req: Request, res: Response) => {
	const device_key = req.params.id
	try {
		const device = await Device.findOne({where:{[Op.and]:[{device_key},{deleted_flag:0}]}});
		res.status(200).json(device)
	} catch (error) {
		console.log(error);
		res.status(500).json({ msg: "Contact the administrator" });
	}
};


export const addDevice = async (req: Request, res: Response) => {
	const fecha = new Date()
	const gmt:any = process.env.GMT
	fecha.setHours(fecha.getHours()-gmt)
	const  { device_key, name, logo_uri = '', direction, secret,  userAuth } = req.body

	try {
		const newDevice = {
			site_id:1,
			group_id:0,
			device_key, //* */
			name, //* */
			logo_uri, //* */
			secret, //* */
			current_version_id:0,
			current_version_name:'1.0.0.0',
			person_count:0,
			face_count:0,
			disk_space:0,
			ip:'192.168.1.0',
			last_active_time:formatDate(fecha),
			is_online:0,
			direction, //* */
			status:0,
			create_time:formatDate(fecha),
			create_user:userAuth.name,
			deleted_flag:0
		}

		const device = Device.build(newDevice);
		await device.save();

		res.status(200).json(newDevice)
	} catch (error) {
		console.log(error);
		res.status(500).json({ msg: "Contact the administrator" });
	}
};



export const updateDevice = async (req: Request, res: Response) => {
	const device_key = req.params.id
	const fecha = new Date()
	const gmt:any = process.env.GMT
	fecha.setHours(fecha.getHours()-gmt)
	const  {name, logo_uri = '', direction, is_online, status , secret, userAuth } = req.body

	try {
		//TODO Ver la actualizacion
		const updateDevice = {
			device_key, //* */
			name, //* */
			logo_uri, //* */
			secret, //* */
			is_online, //* */
			direction, //* */
			status, //* */
			update_time:formatDate(fecha),
			update_user:userAuth.name,
		}
		await Device.update( updateDevice , { where: { device_key } });
		res.status(200).json(updateDevice)

	} catch (error) {
		console.log(error);
		res.status(500).json({ msg: "Contact the administrator" });
	}
};

export const deleteDevice = async (req: Request, res: Response) => {
	const device_key = req.params.id
    console.log("🚀 ~ file: admin.ts ~ line 529 ~ deleteDevice ~ device_key", device_key)
	const { userAuth } = req.body
	try {
		const updateDevice = {
			update_time:formatDate(fecha),
			update_user:userAuth.name,
			deleted_flag:1
		}

		await Device.update( updateDevice, { where: { device_key } });
		res.status(200).json(updateDevice)

	} catch (error) {
		console.log(error);
		res.status(500).json({ msg: "Contact the administrator" });
	}
};