"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ftpDeploy = void 0;
const FtpDeploy = require("ftp-deploy");
const ftpDeploy = async (remoteRoot, include, localRoot) => {
    const ftpDeploy = new FtpDeploy();
    const config = {
        user: process.env.FTP_USER,
        password: process.env.FTP_PASS,
        host: process.env.FTP_HOST,
        port: process.env.FTP_PORT,
        localRoot: localRoot,
        include: [include],
        remoteRoot: remoteRoot,
        deleteRemote: false,
        forcePasv: true,
        sftp: false,
    };
    ftpDeploy.deploy(config)
        .then((res) => console.log("finished:", res))
        .catch((err) => console.log("Error ", err));
};
exports.ftpDeploy = ftpDeploy;
//# sourceMappingURL=ftpDeploy.js.map