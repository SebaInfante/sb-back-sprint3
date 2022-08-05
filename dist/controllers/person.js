"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downReport = exports.downloadReportRecords = exports.sendEmailDeletePerson = exports.deleteFile = exports.deletePerson = exports.IdcardFront = exports.docsFile = exports.photoPreview = exports.addPerson = exports.validarRut = exports.downloadFicha = exports.downloadDoc = exports.getDocuments = exports.getDocumentsPerson = exports.getAllEmployment = exports.getPerson = exports.getFichaPerson = exports.updateDatos = exports.getEmployment = exports.getPersons = void 0;
const path_1 = __importDefault(require("path"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const uuid_1 = require("uuid");
const xl = require("excel4node");
const { Op } = require("sequelize");
const Document_1 = __importDefault(require("../models/Document"));
const Employment_1 = __importDefault(require("../models/Employment"));
const Employee_1 = __importDefault(require("../models/Employee"));
const Person_1 = __importDefault(require("../models/Person"));
const Docfile_1 = __importDefault(require("../models/Docfile"));
const user_1 = __importDefault(require("../models/user"));
const fecha_1 = require("../utils/fecha");
const pdfkit_1 = require("../lib/pdfkit");
const Company_1 = __importDefault(require("../models/Company"));
const s3_1 = require("../lib/s3");
const now = new Date();
// ************************************************************************************************************************
// !                                             Obtengo primero 500 registros de las personas
// ************************************************************************************************************************
const getPersons = async (req, res) => {
    try {
        const userAuth = req.body.userAuth;
        const name = req.body.name || "";
        const rut = req.body.rut || "";
        const ocupacion = req.body.ocupacion || "";
        const intervalo = req.body.intervalo || 365;
        const initDate = req.body.fecha || (0, fecha_1.formatDate)(now);
        const fecha = new Date(initDate);
        const fechaActual = (0, fecha_1.sumarDias)(fecha, 1).split("T", 1).toString();
        const fechaAnterior = (0, fecha_1.restarDias)(fecha, intervalo).split("T", 1).toString();
        let turno = req.body.turno || "";
        let contratista = req.body.contratista || "";
        let employee;
        if (contratista == "all") {
            contratista = "";
        }
        if (turno == "all") {
            turno = "";
        }
        if (userAuth.role === "USC") {
            employee = userAuth.name;
        }
        else {
            !contratista ? (employee = "") : (employee = contratista);
        }
        const Persons = await Person_1.default.findAll({
            attributes: [
                'id',
                'email',
                'person_name',
                ['update_time', 'create_time'],
                'status',
                ['avatar_url', 'avatar'],
                ['person_no', 'id_card'],
                ['employee_name', 'empresa'],
                ['employment_name', 'ocupacion']
            ],
            where: {
                [Op.and]: [
                    { person_name: { [Op.substring]: name } },
                    { person_no: { [Op.substring]: rut } },
                    { employee_name: { [Op.substring]: employee } },
                    { employment_name: { [Op.substring]: ocupacion } },
                    { deleted_flag: 0 },
                    { update_time: { [Op.between]: [fechaAnterior, fechaActual] } }
                ],
            },
            order: [
                ['update_time', 'DESC']
            ],
            limit: 500
        });
        await Persons.map((Person) => {
            Person.dataValues.URL = (0, s3_1.getUrlS3)(Person.dataValues.empresa, Person.dataValues.avatar, Person.dataValues.id_card);
        });
        return res.json(Persons);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ msg: "Contact the administrator" });
    }
};
exports.getPersons = getPersons;
// ************************************************************************************************************************
// !                                             Obtengo las ocupaciones mediante el id.
// ************************************************************************************************************************
const getEmployment = async (req, res) => {
    try {
        let employment;
        const id = req.params.id;
        const { userAuth } = req.body;
        (userAuth.role === "USC")
            ? employment = await Employment_1.default.findAll({ where: { [Op.and]: [{ employee: userAuth.id }, { deleted_flag: 0 }] } })
            : employment = await Employment_1.default.findAll({ where: { [Op.and]: [{ employee: id }, { deleted_flag: 0 }] } });
        if (employment.length == 0) {
            employment = [{ id: 1, employment: "No seleccionado" }];
        }
        return res.json(employment);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ msg: "Contact the administrator" });
    }
};
exports.getEmployment = getEmployment;
// ************************************************************************************************************************
// !                                             Actualizo los datos de las personas.
// ************************************************************************************************************************
const updateDatos = async (req, res) => {
    try {
        const person_no = req.params.id; //TODO aqui tiene que llegar el person_no (rut)
        const { name, email, ocupacion, userAuth } = req.body;
        const Person_data = {
            name,
            email,
            employment_name: await Employment_1.default.findOne({ where: { id: ocupacion }, attributes: ['employment'] }),
            update_time: (0, fecha_1.formatDate)(now),
            update_user: userAuth.name
        };
        const Employee_data = {
            ocupacion,
            update_time: (0, fecha_1.formatDate)(now),
            update_user: userAuth.name
        };
        await Person_1.default.update(Person_data, { where: { person_no } });
        await Employee_1.default.update(Employee_data, { where: { person_no } });
        return res.status(200).json({ msg: "Actualización realizada" });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ msg: "Contact the administrator" });
    }
};
exports.updateDatos = updateDatos;
// ************************************************************************************************************************
// !                                             Genera y descarga la ficha de la persona.
// ************************************************************************************************************************
const getFichaPerson = async (req, res) => {
    try {
        const rut = req.params.rut;
        const Filename = `${(0, uuid_1.v4)()}.pdf`;
        const Persons = await Person_1.default.findOne({ where: { [Op.and]: [{ person_no: { [Op.substring]: rut } }, { deleted_flag: 0 }] } });
        await (0, pdfkit_1.generarPDF)(Persons, Filename);
        setTimeout(() => {
            return res.status(200).json(Filename);
        }, 3000);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
};
exports.getFichaPerson = getFichaPerson;
// ************************************************************************************************************************
// !                                             Obtengo los datos de una persona con su rut.
// ************************************************************************************************************************
const getPerson = async (req, res) => {
    try {
        const rut = req.params.rut;
        const Person_find = await Person_1.default.findOne({ where: { [Op.and]: [{ person_no: rut }, { deleted_flag: 0 }] } });
        Person_find.dataValues.URL = (0, s3_1.getUrlS3)(Person_find.dataValues.employee_name, Person_find.dataValues.avatar_url, Person_find.dataValues.person_no);
        const Employee_find = await Employee_1.default.findOne({ where: { [Op.and]: [{ person_no: rut }, { deleted_flag: 0 }] } });
        const Docfile_find = await Docfile_1.default.findAll({ where: { [Op.and]: [{ person_no: rut }, { deleted_flag: 0 }] } });
        return res.json({ Person_find, Docfile_find, Employee_find });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
};
exports.getPerson = getPerson;
// ************************************************************************************************************************
// !                                             Obtengo todos las ocupaciones que existen siendo admin.
// ************************************************************************************************************************
const getAllEmployment = async (req, res) => {
    try {
        const userAuth = req.body.userAuth;
        if (userAuth.role === "ADM") {
            const employment = await Employment_1.default.findAll({ where: { deleted_flag: 0 } });
            return res.json(employment);
        }
    }
    catch (error) {
        console.log(error);
        res.status(403).json({ msg: "Contact the administrator" });
    }
};
exports.getAllEmployment = getAllEmployment;
// ************************************************************************************************************************
// !                                             Obtengo todos los documentos relacionados a una persona.
// ************************************************************************************************************************
const getDocumentsPerson = async (req, res) => {
    try {
        const { idDoc, id_person } = req.body;
        const Docfile_find = await Docfile_1.default.findAll({ where: { [Op.and]: [{ person_no: id_person }, { document_id: idDoc }, { deleted_flag: 0 }] } });
        return res.json(Docfile_find);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
};
exports.getDocumentsPerson = getDocumentsPerson;
// ************************************************************************************************************************
// !                                             Obtengo todos los documentos relacionados a una ocupacion.
// ************************************************************************************************************************
const getDocuments = async (req, res) => {
    try {
        const id = req.body.ocupacion || "";
        const documents = await Document_1.default.findAll({ where: { [Op.and]: [{ employment_id: id }, { deleted_flag: 0 }] } });
        return res.json(documents);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
};
exports.getDocuments = getDocuments;
// ************************************************************************************************************************
// !                                             Descargo un documento cargado usando el nombre de este.
// ************************************************************************************************************************
const downloadDoc = async (req, res) => {
    console.log(req.body);
    try {
        const url = (0, s3_1.getUrlS3Docfile)(req.body.group_name, req.body.name, req.body.person_no);
        res.status(200).json(url);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
};
exports.downloadDoc = downloadDoc;
// ************************************************************************************************************************
// !                                             Descargo un documento cargado usando el nombre de este.
// ************************************************************************************************************************
const downloadFicha = async (req, res) => {
    try {
        let filename = req.params.resource_url;
        let url = path_1.default.join(__dirname, "../..", "uploads/fichas", filename);
        res.status(200).download(url);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
};
exports.downloadFicha = downloadFicha;
// ************************************************************************************************************************
// !                                             Valida un rut si esta utilizado en una empresa.
// ************************************************************************************************************************
const validarRut = async (req, res) => {
    try {
        const rut = req.body.rut;
        const Employee_find = await Employee_1.default.findAll({ where: { [Op.and]: [{ person_no: rut }, { deleted_flag: 0 }] } });
        if (Employee_find.length === 0) {
            return res.status(200).json(true);
        }
        else {
            return res.status(400).json({ msg: "Rut ya registrado" });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
};
exports.validarRut = validarRut;
// ************************************************************************************************************************
// !                                             Agrega una nueva persona a los registros (data y avatar).
// ************************************************************************************************************************
const addPerson = async (req, res) => {
    const fecha = new Date();
    const gmt = process.env.GMT;
    fecha.setHours(fecha.getHours() - gmt);
    const { person_no, name, gender, email, employee, employment, qr_url, userAuth } = req.body;
    const imagen = req.file;
    const Filename = `${(0, uuid_1.v4)()}.png`;
    const UsuarioExiste = await Person_1.default.findOne({ where: { person_no } });
    const Employee_find = await Company_1.default.findOne({ where: { id: employee } });
    const Employment_find = await Employment_1.default.findOne({ where: { id: employment } });
    (0, s3_1.putS3newPerson)(imagen, Employee_find.name, person_no, Filename);
    // const ArrDiviceKey = ['F4970C5C3419ACBC','EF38DD40511C2EB2', FBDAE5D85255288C];
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
    var urlencodedAddPerson = new URLSearchParams();
    urlencodedAddPerson.append("deviceKey", "FBDAE5D85255288C");
    urlencodedAddPerson.append("secret", "tdx");
    urlencodedAddPerson.append("id", person_no);
    urlencodedAddPerson.append("name", name);
    urlencodedAddPerson.append("idcardNum", qr_url);
    urlencodedAddPerson.append("expireTime", "");
    urlencodedAddPerson.append("blacklist", "");
    urlencodedAddPerson.append("vaccination", "");
    urlencodedAddPerson.append("vaccinationTime", "");
    urlencodedAddPerson.append("remark", "El Big Boss");
    const requestOptionsAddPerson = {
        method: 'POST',
        headers: myHeaders,
        body: urlencodedAddPerson,
        redirect: 'follow'
    };
    fetch("http://154.53.37.187:8190/api/person/add", requestOptionsAddPerson).then(response => response.text()).then(result => console.log(result)).catch(error => console.log('error', error));
    // **********************
    var urlencodedAddFace = new URLSearchParams();
    urlencodedAddFace.append("deviceKey", "FBDAE5D85255288C");
    urlencodedAddFace.append("secret", "tdx");
    urlencodedAddFace.append("personId", person_no);
    urlencodedAddFace.append("faceId", "");
    urlencodedAddFace.append("imgBase64", Buffer.from(imagen?.buffer).toString('base64'));
    const requestOptionsAddFace = {
        method: 'POST',
        headers: myHeaders,
        body: urlencodedAddFace,
        redirect: 'follow'
    };
    fetch("http://154.53.37.187:8190/api/face/add", requestOptionsAddFace).then(response => response.text()).then(result => console.log(result)).catch(error => console.log('error', error));
    try {
        if (UsuarioExiste) {
            const updatePerson = {
                person_name: name,
                gender,
                email,
                qr_url,
                employee_name: Employee_find.name,
                employment_name: Employment_find.name,
                status: 1,
                avatar_url: Filename,
                avatar_alias: imagen?.originalname,
                avatar_size: imagen?.size,
                avatar_dimensions: "700*700",
                avatar_suffix: ".png",
                update_time: (0, fecha_1.formatDate)(fecha),
                update_user: userAuth.name,
                deleted_flag: 0
            };
            await Person_1.default.update(updatePerson, { where: { person_no: person_no } });
            const updateEmployee = {
                employer: employee,
                person_no,
                employment,
                update_time: (0, fecha_1.formatDate)(fecha),
                update_user: userAuth.name,
                deleted_flag: 0
            };
            await Employee_1.default.update(updateEmployee, { where: { person_no: person_no } });
            return res.status(200).json({ status: 'ok' });
        }
        else {
            const newPerson = {
                person_no,
                person_name: name,
                gender,
                email,
                qr_url,
                employee_name: Employee_find.name,
                employment_name: Employment_find.name,
                avatar_url: Filename,
                avatar_alias: imagen?.originalname,
                avatar_size: imagen?.size,
                avatar_dimensions: "700*700",
                avatar_suffix: ".png",
                create_user: userAuth.name,
                update_time: (0, fecha_1.formatDate)(fecha),
                create_time: (0, fecha_1.formatDate)(fecha)
            };
            const respPerson = Person_1.default.build(newPerson);
            await respPerson.save();
            const newEmployee = {
                employer: employee,
                person_no,
                employment,
                create_user: userAuth.name
            };
            const respEmployee = Employee_1.default.build(newEmployee);
            await respEmployee.save();
            return res.status(200).json(respEmployee);
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
};
exports.addPerson = addPerson;
// ************************************************************************************************************************
// !                                             Entrega una vista previa de la foto cargada.
// ************************************************************************************************************************
const photoPreview = async (req, res) => {
    try {
        const request = require("request");
        const fs = require("fs");
        const imagen = req.file;
        console.log("🚀 ~ file: person.ts ~ line 376 ~ photoPreview ~ req.file", req.file);
        const idLuxand = req.body.idLuxand;
        if (req.file) {
            const docfile_url = `documents/${req.file?.filename}`;
            let url = path_1.default.join(__dirname, "../..", "uploads/", req.file?.filename);
            var options = {
                method: 'POST',
                url: `https://api.luxand.cloud/photo/verify/${idLuxand}`,
                qs: {},
                headers: { 'token': "944628c81d2347cdac8941c17ab8e866" },
                formData: { photo: fs.createReadStream(url)
                }
            };
            const resource = request(options, function (error, response, body) {
                if (error)
                    throw new Error(error);
                const respuesta = JSON.parse(body);
                console.log(respuesta);
                console.log(body);
                // console.log(deleteRegister(idLuxand));
                return res.status(200).json({ respuesta, docfile_url });
                // return res.status(200).json({respuesta,resizedImageBuffer});
            });
        }
        // const deleteRegister=(idLuxand:any)=>{
        // 	const optDelete = {
        // 			method: 'DELETE', 
        // 			url: `https://api.luxand.cloud/subject/${idLuxand}`, 
        // 			qs: {}, 
        // 			headers: { 'token': "944628c81d2347cdac8941c17ab8e866" } 
        // 		};
        // 	request(optDelete, function (error:any, response:any, body:any) { 
        // 		if (error) throw new Error(error); 
        // 		console.log(body);
        // 		return body
        // 	});
        // }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
};
exports.photoPreview = photoPreview;
// ************************************************************************************************************************
// !                                             Agrega documentos usando el rut del usuario.
// ************************************************************************************************************************
const docsFile = async (req, res) => {
    try {
        if (req.file) {
            const file = req.file;
            const Filename = `${(0, uuid_1.v4)()}${path_1.default.extname(req.file.originalname)}`;
            const { userAuth, employment_id, person_no, document_name, document_id, empresa } = req.body;
            (0, s3_1.putS3newPersonDocfile)(file, empresa, person_no, Filename);
            const newDocfile = {
                employment_id,
                person_no,
                document_name,
                document_id,
                docfile_url: Filename,
                docfile_alias: req.file?.originalname,
                docfile_size: Math.trunc(req.file?.size / 1000),
                docfile_suffix: path_1.default.extname(req.file.originalname),
                create_user: userAuth.name
            };
            const respDocfile = Docfile_1.default.build(newDocfile);
            await respDocfile.save();
            return res.status(200).json(respDocfile);
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
};
exports.docsFile = docsFile;
// ************************************************************************************************************************
// !                                             Agrega documentos usando el rut del usuario.
// ************************************************************************************************************************
const IdcardFront = async (req, res) => {
    try {
        if (req.file) {
            const request = require("request");
            const fs = require("fs");
            const docfile_url = `uploads/${req.file?.filename}`;
            let url = path_1.default.join(__dirname, "../..", "uploads", req.file?.filename);
            const options = {
                method: 'POST',
                url: "https://api.luxand.cloud/subject/v2",
                qs: { "name": "", "store": "1" },
                headers: { 'token': `${process.env.TOKEN_LUXAND}` },
                formData: { photo: fs.createReadStream(url) }
            };
            request(options, function (error, response, body) {
                if (error)
                    throw new Error(error);
                let id = JSON.parse(body);
                fs.unlink(url, (err) => { if (err)
                    throw err; console.log(url); });
                return res.status(200).json({ id, docfile_url });
            });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
};
exports.IdcardFront = IdcardFront;
/// ************************************************************************************************************************
// !                                             Elimina una persona con todos sus archivos.
// ************************************************************************************************************************
const deletePerson = async (req, res) => {
    try {
        const person_no = req.params.id;
        console.log("🚀 ~ file: person.ts ~ line 532 ~ deletePerson ~ person_no", person_no);
        const userAuth = req.body.userAuth;
        const data = {
            update_time: (0, fecha_1.formatDate)(now),
            update_user: userAuth.name,
            deleted_flag: 1
        };
        await Person_1.default.update(data, { where: { person_no } });
        await Employee_1.default.update(data, { where: { person_no } });
        await Docfile_1.default.update(data, { where: { person_no } });
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
        var urlencoded = new URLSearchParams();
        urlencoded.append("deviceKey", "FBDAE5D85255288C");
        urlencoded.append("secret", "tdx");
        urlencoded.append("personId", person_no);
        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: urlencoded,
            redirect: 'follow'
        };
        fetch("http://154.53.37.187:8190/api/person/del", requestOptions).then(response => response.text()).then(result => console.log(result)).catch(error => console.log('error', error));
        return res.status(200).json({ msg: "Usuario Eliminado correctamente" });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
};
exports.deletePerson = deletePerson;
/// ************************************************************************************************************************
// !                                             Elimina un solo archivo usando su id.
// *************************************************************************************************************************
const deleteFile = async (req, res) => {
    try {
        const id = req.params.id;
        const userAuth = req.body.userAuth;
        const data = {
            update_time: (0, fecha_1.formatDate)(now),
            update_user: userAuth.name,
            deleted_flag: 1
        };
        await Docfile_1.default.update(data, { where: { id } });
        return res.status(200).json({ msg: "Archivo Eliminado correctamente" });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
};
exports.deleteFile = deleteFile;
/// ************************************************************************************************************************
// !                                             Envia un email para soltar un empleado.
// *************************************************************************************************************************
const sendEmailDeletePerson = async (req, res) => {
    try {
        const person_no = req.body.rut;
        const Person_find = await Person_1.default.findOne({ where: { [Op.and]: [{ person_no }, { deleted_flag: 0 }] } });
        const Employer_find = await user_1.default.findOne({ where: { name: Person_find.employee_name } });
        const Mandante_find = await user_1.default.findOne({ where: { id: Employer_find.employee } });
        const email = Mandante_find.email;
        const nombre = Mandante_find.name;
        const empresaNombre = Employer_find.name;
        const empresaEmail = Employer_find.email;
        const personaNombre = Person_find.person_name;
        const personaRut = Person_find.person_no;
        const transporter = nodemailer_1.default.createTransport({
            host: "smtp.office365.com",
            port: 587,
            auth: {
                user: process.env.EMAIL_RECOVERY,
                pass: process.env.PASSW_RECOVERY,
            },
        });
        const mandante = await transporter.sendMail({
            from: '"Equipo Auditar" <aisense_bot@aisense.cl>',
            to: email,
            subject: "Solicitud de eliminación de usuario - SmartBoarding",
            html: `
				<h1>Equipo de ${nombre}</h1>
				<p>Se solicita que se pueda poner en contacto con la empresa ${empresaNombre}, email: ${empresaEmail}, para poder dar de baja al trabajador ${personaNombre} con rut ${personaRut} ya 
				que otra empresa, que utiliza Smartboarding necesita enrolarlo a en su equipo de trabajo.</p>
				<p> Saludos</p>
				`,
        });
        transporter.sendMail(mandante, (error, info) => {
            if (error) {
                res.status(500).send(error.message);
            }
            else {
                console.log("Email enviado");
                res.status(200).json(req.body);
            }
        });
        return res.status(200).json({ mensaje: "Se envió un correo de recuperación", estado: "ok" });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
};
exports.sendEmailDeletePerson = sendEmailDeletePerson;
/// ************************************************************************************************************************
// !                                             Genera un reporte excel.
// *************************************************************************************************************************
const downloadReportRecords = async (req, res) => {
    try {
        const userAuth = req.body.userAuth;
        const name = req.body.name || "";
        const rut = req.body.rut || "";
        const ocupacion = req.body.ocupacion || "";
        const intervalo = req.body.intervalo || 365;
        const initDate = req.body.fecha || (0, fecha_1.formatDate)(now);
        const fecha = new Date(initDate);
        const fechaActual = (0, fecha_1.sumarDias)(fecha, 1).split("T", 1).toString();
        const fechaAnterior = (0, fecha_1.restarDias)(fecha, intervalo).split("T", 1).toString();
        let turno = req.body.turno || "";
        let contratista = req.body.contratista || "";
        let employee;
        if (contratista == "all") {
            contratista = "";
        }
        if (turno == "all") {
            turno = "";
        }
        if (userAuth.role === "USC") {
            employee = userAuth.name;
        }
        else {
            !contratista ? (employee = "") : (employee = contratista);
        }
        const Persons = await Person_1.default.findAll({
            attributes: [
                'id',
                'email',
                'person_name',
                'create_time',
                ['avatar_url', 'avatar'],
                ['person_no', 'id_card'],
                ['employee_name', 'empresa'],
                ['employment_name', 'ocupacion']
            ],
            where: {
                [Op.and]: [
                    { person_name: { [Op.substring]: name } },
                    { person_no: { [Op.substring]: rut } },
                    { employee_name: employee },
                    { employment_name: ocupacion },
                    { deleted_flag: 0 },
                    { create_time: { [Op.between]: [fechaAnterior, fechaActual] } }
                ],
            },
            order: [
                ['create_time', 'DESC']
            ],
            limit: 10000
        });
        const wb = new xl.Workbook();
        const ws = wb.addWorksheet("Sheet 1");
        const style = wb.createStyle({
            font: {
                color: "#095B90",
                size: 12,
            },
            numberFormat: "$#,##0.00; ($#,##0.00); -",
        });
        ws.cell(1, 1).string("Rut").style(style);
        ws.cell(1, 2).string("Nombre").style(style);
        ws.cell(1, 3).string("Genero").style(style);
        ws.cell(1, 4).string("Email").style(style);
        ws.cell(1, 5).string("Foto").style(style);
        ws.cell(1, 6).string("Estado").style(style);
        ws.cell(1, 7).string("Empresa").style(style);
        ws.cell(1, 8).string("Ocupación").style(style);
        ws.cell(1, 9).string("Creación").style(style);
        await Persons?.forEach((row, index) => {
            ws.cell(index + 2, 1).string(row?.person_no || "");
            ws.cell(index + 2, 2).string(row?.person_name || "");
            ws.cell(index + 2, 3).string(row?.gender || "");
            ws.cell(index + 2, 4).string(row?.email || "");
            ws.cell(index + 2, 5).string(row?.avatar_url || "");
            ws.cell(index + 2, 6).string(row?.status || "");
            ws.cell(index + 2, 7).string(row?.employee_name || "");
            ws.cell(index + 2, 8).string(row?.employment_name || "");
            ws.cell(index + 2, 9).date(new Date(row?.create_time));
        });
        const Filename = `${(0, uuid_1.v4)()}.xlsx`;
        const pathExcel = path_1.default.join(__dirname, "../..", "excel", Filename);
        await wb.write(pathExcel, function (err, stats) {
            if (err) {
                console.log(err);
            }
            else {
                function downloadFile() {
                    res.download(pathExcel);
                    return res.status(200).json({
                        Filename: Filename,
                        url: "http://localhost:8000/api/records/downreport",
                    });
                }
                downloadFile();
                return false;
            }
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
};
exports.downloadReportRecords = downloadReportRecords;
/// ************************************************************************************************************************
// !                                             Elimina un solo archivo usando su id.
// *************************************************************************************************************************
const downReport = async (req, res) => {
    try {
        const filename = req.params.resource_url;
        const url = path_1.default.join(__dirname, "../..", "excel", filename);
        res.status(200).download(url);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
};
exports.downReport = downReport;
//*********************
//# sourceMappingURL=person.js.map