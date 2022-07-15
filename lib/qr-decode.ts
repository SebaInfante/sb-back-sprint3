import jimp from 'jimp';
const qrCode = require('qrcode-reader');

var fs = require('fs')
var path = require("path")

export const readQRCode = async (fileName:any) => {
    let filePath = path.join(__dirname,'../..',  fileName);

    try {
        if (fs.existsSync(filePath)) {
            const img = await jimp.read(fs.readFileSync(filePath)).then(lenna => {
                return lenna
                    // .contain( 1000, 1000 )
                    // .scale(2.5) // resize
                    .quality(100) // set JPEG quality
                    .greyscale() // set greyscale
                    .contrast( 1)
                    // .dither565()
                    .write('idCard/'+fileName); // save
                });

            const qr = new qrCode();

            const value:any = await new Promise((resolve, reject) => {
                qr.callback = (err:any, v:any) => err != null ? reject(err) : resolve(v);
                qr.decode(img.bitmap);
            });
            return value.result;
        }
    } catch (error:any) {
        return error.message
    }
}