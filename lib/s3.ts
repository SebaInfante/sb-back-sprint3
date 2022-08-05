import AWS from 'aws-sdk';

const Bucket = `${process.env.OBJ_STG_BUCKET}`

export const s3 = new AWS.S3({
    endpoint: `${process.env.OBJ_STG_ENDPOINT}${process.env.OBJ_STG_BUCKET}`,
    accessKeyId: process.env.OBJ_STG_ACCESSKEY,
    secretAccessKey: process.env.OBJ_STG_SECRETKEY,
    s3BucketEndpoint: true,
    signatureVersion: process.env.OBJ_STG_SIGNATURE
});


export const getS3ListRegistros = (group_name:string = '') =>{
    s3.listObjectsV2({
        Bucket,
        Prefix: `${process.env.OBJ_STG_FOLDER}/registros/${group_name}`,
    }, function (err, data:any) {
        if (err) {
            return err
        } else {
            data.Contents.map((objeto:any) => {
                if(objeto.Size !==0){
                    const params = {   
                                    Key: objeto.Key,
                                    Bucket:`${process.env.OBJ_STG_BUCKET}`,
                                    Expires:60*2
                                    }
                    objeto.url = s3.getSignedUrl("getObject", params)
                }
            })
            return data.Contents
        }
    })
}

export const getS3ListPerson = (group_name:string = '', name:string) =>{
    let URL
    s3.listObjectsV2({
        Bucket,
        Prefix: `${process.env.OBJ_STG_FOLDER}/avatar/${group_name}/${name}`,
    }, function (err, data:any) {
        if (err) {
            return err
        } else {
            data.Contents.map((objeto:any) => {
                if(objeto.Size !==0){
                    const params = {   
                                    Key: objeto.Key,
                                    Bucket:`${process.env.OBJ_STG_BUCKET}`,
                                    Expires:60*2
                                    }
                    objeto.url = s3.getSignedUrl("getObject", params)
                    URL = s3.getSignedUrl("getObject", params)
                }
            })
            // return data.Contents
        }
    })
    return URL
}











export const getUrlS3PassRecord =  (url:string) =>{
    const newUrl = url.replaceAll("/","")
    const params = {   
            Key: `${process.env.OBJ_STG_FOLDER}/registros/${newUrl}`,
            Bucket,
            Expires:60*15
        }
    return  s3.getSignedUrl("getObject", params)
}




export const getUrlS3 =  (group_name:string , name:string, person_no:string) =>{            //*  Funcion para obtener una URL 
    const empresa = group_name.charAt(0).toUpperCase() + group_name.slice(1);   
    const params = {   
            Key: `${process.env.OBJ_STG_FOLDER}/avatar/${empresa}/${person_no}/${name}`,    //* la KEY es la ruta donde se encuentra el archivo
            Bucket,                                                                         //* Es el nombre del bucket (smartboarding)
            Expires:60*15                                                                   //* El tiempo que dura la URl en minutos
        }
    return  s3.getSignedUrl("getObject", params)                                            //* Envío estos datos a la funcion 'getSignedUrl' del paquete de s3(aws)
}



export const getUrlS3Docfile =  (group_name:string , name:string, person_no:string) =>{
    const params = {   
            Key: `${process.env.OBJ_STG_FOLDER}/documentos/${group_name}/${person_no}/${name}`,
            Bucket,
            Expires:60*2
        }
    return  s3.getSignedUrl("getObject", params)
}



export const putS3newPerson = (imagen:any, group_name:string,person_no:string, Filename:string ) =>{    //*  Funcion para subir un archivo
    const Body = Buffer.from(imagen?.buffer)                                                            //*  El body es el archivo a subir (doc, img o cualquier cosa)
    const Key = `${process.env.OBJ_STG_FOLDER}/avatar/${group_name}/${person_no}/${Filename}`           //*  La Key es la ruta donde se va a guardar

    s3.putObject({ Body, Bucket, Key, ContentType: imagen.mimetype, }, function(err, data) {            //*  Ejecutamos el putObkects (archivo, nombre del bucket, ruta, el tipo de archivo)
        if (err) {
            console.log('❌-putS3newPerson ',err)
        } else {
            return {status: 'ok', Key, data }
        }
    });
}


export const putS3newPersonDocfile = (file:any, group_name:string, person_no:string, Filename:string ) =>{
    const Body = Buffer.from(file?.buffer)
    const Key = `${process.env.OBJ_STG_FOLDER}/documentos/${group_name}/${person_no}/${Filename}`

    s3.putObject({ Body, Bucket, Key, ContentType: file.mimetype}, function(err, data) {
        if (err) {
            console.log('❌-putS3newPersonDocfile ',err)
        } else {
            return {status: 'ok', Key , data }
        }
    });
}