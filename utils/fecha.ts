
export const sumarDias=(fecha:Date, dias:number)=>{
    fecha.setDate(fecha.getDate() + dias);
    return fecha.toISOString();
}
export const restarDias=(fecha:Date, dias:number)=>{
    fecha.setDate(fecha.getDate() - dias);
    return fecha.toISOString();
}


export const formatDate = (fecha:Date) => {
    const today = fecha.toISOString().replace("T"," ")
    const caracter = today.indexOf(".")
    const resultado = today.slice(0,caracter)

    return resultado;
}