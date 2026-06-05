// src/services/articuloService.js
import { poolPromise } from '../config/db.js';
import sql from 'mssql';

export const getArticulosConEmail = async (params) => {
    const { idPedido } = params;
    const pool = await poolPromise;
    const result = await pool.request()
        .input('idPedido', sql.Int, idPedido)
        .query(`
            SELECT
                PED.PEDIDO   AS Pedido,
                PED.DESTINO,
                CA.DENOMINAC AS NombreCasa,
                CA.MAIL      AS EmailDestino,
                PED.FECHA,
                DPED.CODART,
                ART.DESCRI,
                DPED.CANT
            FROM [Casa09].[dbo].[PEDSUC] PED
            INNER JOIN [Casa09].[dbo].[CASAS]    CA   ON CA.CASA     = PED.DESTINO
            INNER JOIN [Casa09].[dbo].[DPEDSUC]  DPED ON DPED.PEDIDO = PED.PEDIDO
            INNER JOIN [Casa09].[dbo].[ARTICULO] ART  ON ART.CODART  = DPED.CODART
            WHERE PED.PEDIDO = @idPedido
        `);

    const filas = result.recordset;

    // Devuelve el objeto que se desparrama en el contexto
    return {
        articulos: filas,
        nombreCasa: filas[0]?.NombreCasa || "Destino",
        fecha: filas[0]?.FECHA
            ? new Date(filas[0].FECHA).toLocaleDateString('es-AR')
            : new Date().toLocaleDateString('es-AR')
    };
};