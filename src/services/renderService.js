import Handlebars from 'handlebars';
import { getFuncionesDeModelo } from './plantillaService.js';
import { obtenerFuncion } from './registry.js';

export const construirContexto = async (idModelo, params) => {
    const funciones = await getFuncionesDeModelo(idModelo);
    const contexto = { ...params };   // params crudos disponibles (ej: idPedido)

    for (const f of funciones) {
        const fn = obtenerFuncion(f.NOMBRE);
        const resultado = await fn(params);

        if (f.DEVUELVE === 'OBJETO') {
            Object.assign(contexto, resultado);          // desparrama las claves
        } else {
            contexto[f.CLAVE_CONTEXTO] = resultado;       // ARRAY / VALOR bajo su clave
        }
    }
    return contexto;
};

export const render = (textoPlantilla, contexto) => {
    return Handlebars.compile(textoPlantilla)(contexto);
};