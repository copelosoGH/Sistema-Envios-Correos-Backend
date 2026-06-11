import { poolPromise } from '../config/db.js';
import sql from 'mssql';

export const getMailCasa = async (casa) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('casa', sql.Int, casa)
        .query(`
            SELECT CASA, DENOMINAC, MAIL, INACTIVO
            FROM [Casa09].[dbo].[CASAS]
            WHERE CASA = @casa
        `);

    const fila = result.recordset[0];
    if (!fila) return null;

    return {
        casa:         fila.CASA,
        denominacion: fila.DENOMINAC,
        mail:         fila.MAIL,
        inactivo:     fila.INACTIVO === 1
    };
};