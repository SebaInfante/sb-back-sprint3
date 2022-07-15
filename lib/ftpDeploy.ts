const FtpDeploy = require("ftp-deploy");

export const ftpDeploy = async (remoteRoot: String, include: String, localRoot:string) => {

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
        .then((res: any) => console.log("finished:", res))
        .catch((err: any) => console.log("Error ", err));
};





