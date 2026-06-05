// src/services/plantillaService.js
import { poolPromise } from '../config/db.js';
import sql from 'mssql';

// Trae la plantilla (asunto + cuerpo)
export const getPlantilla = async (idModelo) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('id', sql.Int, idModelo)
        .query(`
            SELECT ID, NOMBRE, ASUNTO, CUERPO
            FROM Mail.PLANTILLA
            WHERE ID = @id AND ACTIVO = 1
        `);
    return result.recordset[0] || null;
};

// Trae las funciones asociadas a esa plantilla, ordenadas
export const getFuncionesDeModelo = async (idModelo) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('id', sql.Int, idModelo)
        .query(`
            SELECT F.NOMBRE, F.DEVUELVE, F.CLAVE_CONTEXTO
            FROM Mail.MODELO_FUNCION MF
            INNER JOIN Mail.FUNCION F ON F.ID = MF.ID_FUNCION
            WHERE MF.ID_PLANTILLA = @id
            ORDER BY MF.ORDEN
        `);
    return result.recordset;
};