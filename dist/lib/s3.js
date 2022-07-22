"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.putS3newPersonDocfile = exports.putS3newPerson = exports.getUrlS3Docfile = exports.getUrlS3 = exports.getS3ListPerson = exports.getS3ListRegistros = exports.s3 = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const Bucket = `${process.env.OBJ_STG_BUCKET}`;
exports.s3 = new aws_sdk_1.default.S3({
    endpoint: `${process.env.OBJ_STG_ENDPOINT}${process.env.OBJ_STG_BUCKET}`,
    accessKeyId: process.env.OBJ_STG_ACCESSKEY,
    secretAccessKey: process.env.OBJ_STG_SECRETKEY,
    s3BucketEndpoint: true,
    signatureVersion: process.env.OBJ_STG_SIGNATURE
});
const getS3ListRegistros = (group_name = '') => {
    exports.s3.listObjectsV2({
        Bucket,
        Prefix: `${process.env.OBJ_STG_FOLDER}/registros/${group_name}`,
    }, function (err, data) {
        if (err) {
            return err;
        }
        else {
            data.Contents.map((objeto) => {
                if (objeto.Size !== 0) {
                    const params = {
                        Key: objeto.Key,
                        Bucket: `${process.env.OBJ_STG_BUCKET}`,
                        Expires: 60 * 2
                    };
                    objeto.url = exports.s3.getSignedUrl("getObject", params);
                }
            });
            return data.Contents;
        }
    });
};
exports.getS3ListRegistros = getS3ListRegistros;
const getS3ListPerson = (group_name = '', name) => {
    let URL;
    exports.s3.listObjectsV2({
        Bucket,
        Prefix: `${process.env.OBJ_STG_FOLDER}/avatar/${group_name}/${name}`,
    }, function (err, data) {
        if (err) {
            return err;
        }
        else {
            data.Contents.map((objeto) => {
                if (objeto.Size !== 0) {
                    const params = {
                        Key: objeto.Key,
                        Bucket: `${process.env.OBJ_STG_BUCKET}`,
                        Expires: 60 * 2
                    };
                    objeto.url = exports.s3.getSignedUrl("getObject", params);
                    URL = exports.s3.getSignedUrl("getObject", params);
                }
            });
            // return data.Contents
        }
    });
    return URL;
};
exports.getS3ListPerson = getS3ListPerson;
const getUrlS3 = (group_name, name, person_no) => {
    const params = {
        Key: `${process.env.OBJ_STG_FOLDER}/avatar/${group_name}/${person_no}/${name}`,
        Bucket,
        Expires: 60 * 2
    };
    return exports.s3.getSignedUrl("getObject", params);
};
exports.getUrlS3 = getUrlS3;
const getUrlS3Docfile = (group_name, name, person_no) => {
    const params = {
        Key: `${process.env.OBJ_STG_FOLDER}/documentos/${group_name}/${person_no}/${name}`,
        Bucket,
        Expires: 60 * 2
    };
    return exports.s3.getSignedUrl("getObject", params);
};
exports.getUrlS3Docfile = getUrlS3Docfile;
const putS3newPerson = (imagen, group_name, person_no, Filename) => {
    const Body = Buffer.from(imagen === null || imagen === void 0 ? void 0 : imagen.buffer);
    const Key = `${process.env.OBJ_STG_FOLDER}/avatar/${group_name}/${person_no}/${Filename}`;
    exports.s3.putObject({ Body, Bucket, Key, ContentType: imagen.mimetype, }, function (err, data) {
        if (err) {
            console.log('❌-putS3newPerson ', err);
        }
        else {
            return { status: 'ok', Key, data };
        }
    });
};
exports.putS3newPerson = putS3newPerson;
const putS3newPersonDocfile = (file, group_name, person_no, Filename) => {
    const Body = Buffer.from(file === null || file === void 0 ? void 0 : file.buffer);
    const Key = `${process.env.OBJ_STG_FOLDER}/documentos/${group_name}/${person_no}/${Filename}`;
    exports.s3.putObject({ Body, Bucket, Key, ContentType: file.mimetype }, function (err, data) {
        if (err) {
            console.log('❌-putS3newPersonDocfile ', err);
        }
        else {
            return { status: 'ok', Key, data };
        }
    });
};
exports.putS3newPersonDocfile = putS3newPersonDocfile;
//# sourceMappingURL=s3.js.map