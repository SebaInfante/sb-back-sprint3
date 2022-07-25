"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readQRCode = void 0;
const jimp_1 = __importDefault(require("jimp"));
const qrCode = require('qrcode-reader');
var fs = require('fs');
var path = require("path");
const readQRCode = async (fileName) => {
    let filePath = path.join(__dirname, '../..', fileName);
    try {
        if (fs.existsSync(filePath)) {
            const img = await jimp_1.default.read(fs.readFileSync(filePath)).then(lenna => {
                return lenna
                    // .contain( 1000, 1000 )
                    // .scale(2.5) // resize
                    .quality(100) // set JPEG quality
                    .greyscale() // set greyscale
                    .contrast(1)
                    // .dither565()
                    .write('idCard/' + fileName); // save
            });
            const qr = new qrCode();
            const value = await new Promise((resolve, reject) => {
                qr.callback = (err, v) => err != null ? reject(err) : resolve(v);
                qr.decode(img.bitmap);
            });
            return value.result;
        }
    }
    catch (error) {
        return error.message;
    }
};
exports.readQRCode = readQRCode;
//# sourceMappingURL=qr-decode.js.map