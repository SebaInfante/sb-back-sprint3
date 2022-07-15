"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downReport = exports.downloadReportRecords = exports.sendEmailDeletePerson = exports.deleteFile = exports.deletePerson = exports.IdcardBack = exports.IdcardFront = exports.docsFile = exports.photoPreview = exports.addPerson = exports.validarRut = exports.downloadFicha = exports.downloadDoc = exports.getDocuments = exports.getDocumentsPerson = exports.getAllEmployment = exports.getPerson = exports.getFichaPerson = exports.updateDatos = exports.getEmployment = exports.getPersons = void 0;
const sharp_1 = __importDefault(require("sharp"));
const fs_1 = __importDefault(require("fs"));
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
const ftpDeploy_1 = require("../lib/ftpDeploy");
const qr_decode_1 = require("../lib/qr-decode");
const Company_1 = __importDefault(require("../models/Company"));
const now = new Date();
// ************************************************************************************************************************
// !                                             Obtengo primero 500 registros de las personas
// ************************************************************************************************************************
const getPersons = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const Persons = yield Person_1.default.findAll({
            attributes: [
                'id',
                'email',
                'person_name',
                'create_time',
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
                    { create_time: { [Op.between]: [fechaAnterior, fechaActual] } }
                ],
            },
            order: [
                ['create_time', 'DESC']
            ],
            limit: 500
        });
        return res.json(Persons);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ msg: "Contact the administrator" });
    }
});
exports.getPersons = getPersons;
// ************************************************************************************************************************
// !                                             Obtengo las ocupaciones mediante el id.
// ************************************************************************************************************************
const getEmployment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let employment;
        const id = req.params.id;
        console.log("🚀 ~ file: person.ts ~ line 101 ~ getEmployment ~ id", id);
        const { userAuth } = req.body;
        (userAuth.role === "USC")
            ? employment = yield Employment_1.default.findAll({ where: { [Op.and]: [{ employee: userAuth.id }, { deleted_flag: 0 }] } })
            : employment = yield Employment_1.default.findAll({ where: { [Op.and]: [{ employee: id }, { deleted_flag: 0 }] } });
        console.log("🚀 ~ file: person.ts ~ line 107 ~ getEmployment ~ employment", employment);
        if (employment.length == 0) {
            employment = [{ id: 1, employment: "No seleccionado" }];
        }
        return res.json(employment);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ msg: "Contact the administrator" });
    }
});
exports.getEmployment = getEmployment;
// ************************************************************************************************************************
// !                                             Actualizo los datos de las personas.
// ************************************************************************************************************************
const updateDatos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const person_no = req.params.id; //TODO aqui tiene que llegar el person_no (rut)
        const { name, email, ocupacion, userAuth } = req.body;
        const Person_data = {
            name,
            email,
            employment_name: yield Employment_1.default.findOne({ where: { id: ocupacion }, attributes: ['employment'] }),
            update_time: (0, fecha_1.formatDate)(now),
            update_user: userAuth.name
        };
        const Employee_data = {
            ocupacion,
            update_time: (0, fecha_1.formatDate)(now),
            update_user: userAuth.name
        };
        yield Person_1.default.update(Person_data, { where: { person_no } });
        yield Employee_1.default.update(Employee_data, { where: { person_no } });
        return res.status(200).json({ msg: "Actualización realizada" });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ msg: "Contact the administrator" });
    }
});
exports.updateDatos = updateDatos;
// ************************************************************************************************************************
// !                                             Genera y descarga la ficha de la persona.
// ************************************************************************************************************************
const getFichaPerson = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const rut = req.params.rut;
        const Filename = `${(0, uuid_1.v4)()}.pdf`;
        const Persons = yield Person_1.default.findOne({ where: { [Op.and]: [{ person_no: { [Op.substring]: rut } }, { deleted_flag: 0 }] } });
        yield (0, pdfkit_1.generarPDF)(Persons, Filename);
        let url = path_1.default.join(__dirname, "../..", "uploads/fichas", Filename);
        setTimeout(() => {
            // res.download(url);
            return res.status(200).json(Filename);
        }, 3000);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
});
exports.getFichaPerson = getFichaPerson;
// ************************************************************************************************************************
// !                                             Obtengo los datos de una persona con su rut.
// ************************************************************************************************************************
const getPerson = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const rut = req.params.rut;
        const Person_find = yield Person_1.default.findOne({ where: { [Op.and]: [{ person_no: rut }, { deleted_flag: 0 }] } });
        const Employee_find = yield Employee_1.default.findOne({ where: { [Op.and]: [{ person_no: rut }, { deleted_flag: 0 }] } });
        const Docfile_find = yield Docfile_1.default.findAll({ where: { [Op.and]: [{ person_no: rut }, { deleted_flag: 0 }] } });
        console.log("🚀 ~ file: person.ts ~ line 187 ~ getPerson ~ Person_find", Person_find);
        return res.json({ Person_find, Docfile_find, Employee_find });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
});
exports.getPerson = getPerson;
// ************************************************************************************************************************
// !                                             Obtengo todos las ocupaciones que existen siendo admin.
// ************************************************************************************************************************
const getAllEmployment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userAuth = req.body.userAuth;
        if (userAuth.role === "ADM") {
            const employment = yield Employment_1.default.findAll({ where: { deleted_flag: 0 } });
            return res.json(employment);
        }
    }
    catch (error) {
        console.log(error);
        res.status(403).json({ msg: "Contact the administrator" });
    }
});
exports.getAllEmployment = getAllEmployment;
// ************************************************************************************************************************
// !                                             Obtengo todos los documentos relacionados a una persona.
// ************************************************************************************************************************
const getDocumentsPerson = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { idDoc, id_person } = req.body;
        console.log("🚀 ~ file: person.ts ~ line 220 ~ getDocumentsPerson ~ id_person", id_person);
        console.log("🚀 ~ file: person.ts ~ line 220 ~ getDocumentsPerson ~ idDoc", idDoc);
        const Docfile_find = yield Docfile_1.default.findAll({ where: { [Op.and]: [{ person_no: id_person }, { document_id: idDoc }, { deleted_flag: 0 }] } });
        console.log("🚀 ~ file: person.ts ~ line 222 ~ getDocumentsPerson ~ Docfile_find", Docfile_find);
        return res.json(Docfile_find);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
});
exports.getDocumentsPerson = getDocumentsPerson;
// ************************************************************************************************************************
// !                                             Obtengo todos los documentos relacionados a una ocupacion.
// ************************************************************************************************************************
const getDocuments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.body.ocupacion || "";
        const documents = yield Document_1.default.findAll({ where: { [Op.and]: [{ employment_id: id }, { deleted_flag: 0 }] } });
        return res.json(documents);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
});
exports.getDocuments = getDocuments;
// ************************************************************************************************************************
// !                                             Descargo un documento cargado usando el nombre de este.
// ************************************************************************************************************************
const downloadDoc = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let filename = req.params.resource_url;
        let url = path_1.default.join(__dirname, "../..", "documents", filename);
        res.status(200).download(url);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
});
exports.downloadDoc = downloadDoc;
// ************************************************************************************************************************
// !                                             Descargo un documento cargado usando el nombre de este.
// ************************************************************************************************************************
const downloadFicha = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let filename = req.params.resource_url;
        let url = path_1.default.join(__dirname, "../..", "uploads/fichas", filename);
        res.status(200).download(url);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
});
exports.downloadFicha = downloadFicha;
// ************************************************************************************************************************
// !                                             Valida un rut si esta utilizado en una empresa.
// ************************************************************************************************************************
const validarRut = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const rut = req.body.rut;
        const Employee_find = yield Employee_1.default.findAll({ where: { [Op.and]: [{ person_no: rut }, { deleted_flag: 0 }] } });
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
});
exports.validarRut = validarRut;
// ************************************************************************************************************************
// !                                             Agrega una nueva persona a los registros (data y avatar).
// ************************************************************************************************************************
const addPerson = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { person_no, name, gender, email, employee, employment, qr_url, userAuth } = req.body;
    console.log("🚀 ~ file: person.ts ~ line 295 ~ addPerson ~ qr_url", qr_url);
    const imagen = req.file;
    const Filename = `${(0, uuid_1.v4)()}.png`;
    const UsuarioExiste = yield Person_1.default.findOne({ where: { person_no, deleted_flag: 1 } });
    const Employee_find = yield Company_1.default.findOne({ where: { id: employee } });
    const Employment_find = yield Employment_1.default.findOne({ where: { id: employment } });
    const processedImage = (0, sharp_1.default)(imagen === null || imagen === void 0 ? void 0 : imagen.buffer);
    const resizedImageBuffer = yield processedImage.resize(700, 700, { fit: "cover", background: "#FFF" }).toBuffer();
    fs_1.default.writeFileSync(`uploads/${Filename}`, resizedImageBuffer); //Aqui se crea la imagen
    let localRoot = path_1.default.join(__dirname, "../..", "uploads");
    yield (0, ftpDeploy_1.ftpDeploy)("/avatar", "*.png", localRoot);
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
                avatar_alias: imagen === null || imagen === void 0 ? void 0 : imagen.originalname,
                avatar_size: Math.trunc(resizedImageBuffer.byteLength / 1000),
                avatar_dimensions: "700*700",
                avatar_suffix: ".png",
                update_time: (0, fecha_1.formatDate)(now),
                update_user: userAuth.name,
                deleted_flag: 0
            };
            console.log("🚀 ~ file: person.ts ~ line 326 ~ addPerson ~ updatePerson", updatePerson);
            let person = yield Person_1.default.update(updatePerson, { where: { person_no: person_no } });
            console.log("🚀 ~ file: person.ts ~ line 329 ~ addPerson ~ person", person);
            const updateEmployee = {
                employer: employee,
                person_no,
                employment,
                update_time: (0, fecha_1.formatDate)(now),
                update_user: userAuth.name,
                deleted_flag: 0
            };
            let employeeUpdate = yield Employee_1.default.update(updateEmployee, { where: { person_no: person_no } });
            console.log("🚀 ~ file: person.ts ~ line 340 ~ addPerson ~ employeeUpdate", employeeUpdate);
            return res.status(200);
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
                avatar_alias: imagen === null || imagen === void 0 ? void 0 : imagen.originalname,
                avatar_size: Math.trunc(resizedImageBuffer.byteLength / 1000),
                avatar_dimensions: "700*700",
                avatar_suffix: ".png",
                create_user: userAuth.name
            };
            const respPerson = Person_1.default.build(newPerson);
            yield respPerson.save();
            const newEmployee = {
                employer: employee,
                person_no,
                employment,
                create_user: userAuth.name
            };
            const respEmployee = Employee_1.default.build(newEmployee);
            yield respEmployee.save();
            return res.status(200).json(respEmployee);
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
});
exports.addPerson = addPerson;
// ************************************************************************************************************************
// !                                             Entrega una vista previa de la foto cargada.
// ************************************************************************************************************************
const photoPreview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const request = require("request");
        const fs = require("fs");
        const imagen = req.file;
        console.log("🚀 ~ file: person.ts ~ line 376 ~ photoPreview ~ req.file", req.file);
        const idLuxand = req.body.idLuxand;
        // const processedImage = sharp(imagen?.buffer);
        // const resizedImage = processedImage.resize(700, 700, { fit: "cover", background: "#FFF" });
        // const resizedImageBuffer = await resizedImage.toBuffer();
        // const filename = `${uuidv4()}.png`;
        // fs.writeFileSync(`uploads/${filename}`, resizedImageBuffer); //Aqui se envia o crea
        // let url = path.join(__dirname, "../..", "uploads", filename);
        if (req.file) {
            const docfile_url = `documents/${(_a = req.file) === null || _a === void 0 ? void 0 : _a.filename}`;
            let url = path_1.default.join(__dirname, "../..", "documents/", (_b = req.file) === null || _b === void 0 ? void 0 : _b.filename);
            var options = {
                method: 'POST',
                url: `https://api.luxand.cloud/photo/verify/${idLuxand}`,
                qs: {},
                headers: { 'token': "944628c81d2347cdac8941c17ab8e866" },
                formData: { photo: fs.createReadStream(url)
                    // or use URL // photo: 'https://dashboard.luxand.cloud/img/brad.jpg' 
                }
            };
            const resource = request(options, function (error, response, body) {
                if (error)
                    throw new Error(error);
                const respuesta = JSON.parse(body);
                console.log(respuesta);
                console.log(body);
                console.log(deleteRegister(idLuxand));
                return res.status(200).json({ respuesta, docfile_url });
                // return res.status(200).json({respuesta,resizedImageBuffer});
            });
        }
        const deleteRegister = (idLuxand) => {
            const optDelete = {
                method: 'DELETE',
                url: `https://api.luxand.cloud/subject/${idLuxand}`,
                qs: {},
                headers: { 'token': "944628c81d2347cdac8941c17ab8e866" }
            };
            request(optDelete, function (error, response, body) {
                if (error)
                    throw new Error(error);
                console.log(body);
                return body;
            });
        };
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
});
exports.photoPreview = photoPreview;
// ************************************************************************************************************************
// !                                             Agrega documentos usando el rut del usuario.
// ************************************************************************************************************************
const docsFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d, _e;
    try {
        if (req.file) {
            const { userAuth, employment_id, person_no, document_name, document_id } = req.body;
            const newDocfile = {
                employment_id,
                person_no,
                document_name,
                document_id,
                docfile_url: `documents/${(_c = req.file) === null || _c === void 0 ? void 0 : _c.filename}`,
                docfile_alias: (_d = req.file) === null || _d === void 0 ? void 0 : _d.originalname,
                docfile_size: Math.trunc(((_e = req.file) === null || _e === void 0 ? void 0 : _e.size) / 1000),
                docfile_suffix: path_1.default.extname(req.file.originalname),
                create_user: userAuth.name
            };
            let localRoot = path_1.default.join(__dirname, "../..", "documents");
            yield (0, ftpDeploy_1.ftpDeploy)("/documents", "*", localRoot);
            const respDocfile = Docfile_1.default.build(newDocfile);
            yield respDocfile.save();
            return res.status(200).json(respDocfile);
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
});
exports.docsFile = docsFile;
// ************************************************************************************************************************
// !                                             Agrega documentos usando el rut del usuario.
// ************************************************************************************************************************
const IdcardFront = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _f, _g;
    try {
        if (req.file) {
            const request = require("request");
            const fs = require("fs");
            const docfile_url = `documents/${(_f = req.file) === null || _f === void 0 ? void 0 : _f.filename}`;
            let url = path_1.default.join(__dirname, "../..", "documents/", (_g = req.file) === null || _g === void 0 ? void 0 : _g.filename);
            const options = {
                method: 'POST',
                url: "https://api.luxand.cloud/subject/v2",
                qs: { "name": "", "store": "1" },
                headers: { 'token': "944628c81d2347cdac8941c17ab8e866" },
                formData: { photo: fs.createReadStream(url) }
            };
            request(options, function (error, response, body) {
                if (error)
                    throw new Error(error);
                console.log(body);
                let id = JSON.parse(body);
                console.log("🚀 ~ file: person.ts ~ line 448 ~ id", id);
                return res.status(200).json({ id, docfile_url });
            });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
});
exports.IdcardFront = IdcardFront;
// ************************************************************************************************************************
// !                                             Agrega documentos usando el rut del usuario.
// ************************************************************************************************************************
const IdcardBack = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _h;
    try {
        if (req.file) {
            const docfile_url = `documents/${(_h = req.file) === null || _h === void 0 ? void 0 : _h.filename}`;
            const infoIdFront = yield (0, qr_decode_1.readQRCode)(docfile_url);
            console.log("🚀 ~ file: person.ts ~ line 432 ~ IdcardBack ~ infoIdFront", infoIdFront);
            //TODO desfracmentar la info que entrega Rut y codigo de serie
            //TODO https://portal.sidiv.registrocivil.cl/usuarios-portal/pages/DocumentRequestStatus.xhtml?RUN=18143733-2&type=CEDULA&serial=527886183
            return res.status(200).json(infoIdFront);
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
});
exports.IdcardBack = IdcardBack;
/// ************************************************************************************************************************
// !                                             Elimina una persona con todos sus archivos.
// ************************************************************************************************************************
const deletePerson = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const person_no = req.params.id;
        console.log("🚀 ~ file: person.ts ~ line 532 ~ deletePerson ~ person_no", person_no);
        const userAuth = req.body.userAuth;
        const data = {
            update_time: (0, fecha_1.formatDate)(now),
            update_user: userAuth.name,
            deleted_flag: 1
        };
        yield Person_1.default.update(data, { where: { person_no } });
        yield Employee_1.default.update(data, { where: { person_no } });
        yield Docfile_1.default.update(data, { where: { person_no } });
        return res.status(200).json({ msg: "Usuario Eliminado correctamente" });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
});
exports.deletePerson = deletePerson;
/// ************************************************************************************************************************
// !                                             Elimina un solo archivo usando su id.
// *************************************************************************************************************************
const deleteFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const userAuth = req.body.userAuth;
        const data = {
            update_time: (0, fecha_1.formatDate)(now),
            update_user: userAuth.name,
            deleted_flag: 1
        };
        yield Docfile_1.default.update(data, { where: { id } });
        return res.status(200).json({ msg: "Archivo Eliminado correctamente" });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
});
exports.deleteFile = deleteFile;
/// ************************************************************************************************************************
// !                                             Envia un email para soltar un empleado.
// *************************************************************************************************************************
const sendEmailDeletePerson = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const person_no = req.body.rut;
        const Person_find = yield Person_1.default.findOne({ where: { [Op.and]: [{ person_no }, { deleted_flag: 0 }] } });
        const Employer_find = yield user_1.default.findOne({ where: { name: Person_find.employee_name } });
        const Mandante_find = yield user_1.default.findOne({ where: { id: Employer_find.employee } });
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
        const mailOption = yield transporter.sendMail({
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
        transporter.sendMail(mailOption, (error, info) => {
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
});
exports.sendEmailDeletePerson = sendEmailDeletePerson;
/// ************************************************************************************************************************
// !                                             Genera un reporte excel.
// *************************************************************************************************************************
const downloadReportRecords = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const Persons = yield Person_1.default.findAll({
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
        yield (Persons === null || Persons === void 0 ? void 0 : Persons.forEach((row, index) => {
            ws.cell(index + 2, 1).string((row === null || row === void 0 ? void 0 : row.person_no) || "");
            ws.cell(index + 2, 2).string((row === null || row === void 0 ? void 0 : row.person_name) || "");
            ws.cell(index + 2, 3).string((row === null || row === void 0 ? void 0 : row.gender) || "");
            ws.cell(index + 2, 4).string((row === null || row === void 0 ? void 0 : row.email) || "");
            ws.cell(index + 2, 5).string((row === null || row === void 0 ? void 0 : row.avatar_url) || "");
            ws.cell(index + 2, 6).string((row === null || row === void 0 ? void 0 : row.status) || "");
            ws.cell(index + 2, 7).string((row === null || row === void 0 ? void 0 : row.employee_name) || "");
            ws.cell(index + 2, 8).string((row === null || row === void 0 ? void 0 : row.employment_name) || "");
            ws.cell(index + 2, 9).date(new Date(row === null || row === void 0 ? void 0 : row.create_time));
        }));
        const Filename = `${(0, uuid_1.v4)()}.xlsx`;
        const pathExcel = path_1.default.join(__dirname, "../..", "excel", Filename);
        yield wb.write(pathExcel, function (err, stats) {
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
});
exports.downloadReportRecords = downloadReportRecords;
/// ************************************************************************************************************************
// !                                             Elimina un solo archivo usando su id.
// *************************************************************************************************************************
const downReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filename = req.params.resource_url;
        const url = path_1.default.join(__dirname, "../..", "excel", filename);
        res.status(200).download(url);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Contact the administrator" });
    }
});
exports.downReport = downReport;
//*********************
//# sourceMappingURL=person.js.map