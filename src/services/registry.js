// src/services/registry.js
import { getArticulosConEmail } from './articuloService.js';

// Diccionario: nombre en la base → función real de Node.
// Si una función no está acá, NO se ejecuta (whitelist de seguridad).
const registry = {
    getArticulosConEmail,
    // getClientes, getStockBajo, ... se agregan acá en el futuro
};

export const obtenerFuncion = (nombre) => {
    const fn = registry[nombre];
    if (!fn) {
        throw new Error(`Función '${nombre}' no está registrada en el sistema.`);
    }
    return fn;
};