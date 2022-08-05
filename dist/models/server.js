"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const connectionResgisters_1 = __importDefault(require("../db/connectionResgisters"));
const admin_1 = __importDefault(require("../routes/admin"));
const users_1 = __importDefault(require("../routes/users"));
const auth_1 = __importDefault(require("../routes/auth"));
const person_1 = __importDefault(require("../routes/person"));
const records_1 = __importDefault(require("../routes/records"));
const dashboard_1 = __importDefault(require("../routes/dashboard"));
const reportes_1 = __importDefault(require("../routes/reportes"));
class Server {
    constructor() {
        this.apiPaths = {
            admin: "/api/admin",
            users: "/api/users",
            person: "/api/person",
            auth: "/api/auth",
            records: "/api/records",
            dashboard: "/api/dashboard",
            reportes: "/api/reportes",
        };
        this.app = (0, express_1.default)(); //Usar Express
        this.port = process.env.PORT || "8000"; //Habilitar el puerto del .env o el 8000
        this.dbConnectionREG(); //Usar la conexion BD
        this.middlewares(); //Usar los middlewares
        this.routes(); //Usar las rutas
    }
    async dbConnectionREG() {
        try {
            await connectionResgisters_1.default.authenticate();
            console.log('Database Online');
        }
        catch (error) {
            throw new Error(error);
        }
    }
    middlewares() {
        this.app.use((0, cors_1.default)()); //Uso de cors para trabajar de otros computadores
        this.app.use((0, morgan_1.default)("dev")); //Muesta en consola los tipos de peticiones
        // this.app.use(express.urlencoded({ extended : true }));
        this.app.use(express_1.default.json()); //Habilita el uso del body y los transforma en json
        this.app.use(express_1.default.static('public')); // Habilita una pagina web
        this.app.use("/uploads", express_1.default.static(path_1.default.resolve("uploads"))); //?
    }
    routes() {
        this.app.use(this.apiPaths.auth, auth_1.default); //Llamo a los rutas, en este caso el userRoutes
        this.app.use(this.apiPaths.users, users_1.default);
        this.app.use(this.apiPaths.person, person_1.default);
        this.app.use(this.apiPaths.records, records_1.default);
        this.app.use(this.apiPaths.admin, admin_1.default);
        this.app.use(this.apiPaths.dashboard, dashboard_1.default);
        this.app.use(this.apiPaths.reportes, reportes_1.default);
    }
    listen() {
        this.app.listen(this.port, () => {
            console.log(`Servidor corriendo en el puerto ${this.port}`);
        });
    }
}
exports.default = Server;
//# sourceMappingURL=server.js.map