import { poolPromise } from '../config/db.js';
import sql from 'mssql';

export const getArticulosConEmail = async (idPedido) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('idPedido', sql.Int, idPedido)
            .query(`
                SELECT
                    PED.PEDIDO      AS Pedido,
                    PED.DESTINO,
                    CA.DENOMINAC    AS NombreCasa,
                    CA.MAIL         AS EmailDestino,
                    PED.FECHA,
                    DPED.CODART,
                    ART.DESCRI,
                    DPED.CANT
                FROM [Casa09].[dbo].[PEDSUC] PED
                INNER JOIN [Casa09].[dbo].[CASAS]   CA   ON CA.CASA      = PED.DESTINO
                INNER JOIN [Casa09].[dbo].[DPEDSUC] DPED ON DPED.PEDIDO  = PED.PEDIDO
                INNER JOIN [Casa09].[dbo].[ARTICULO] ART ON ART.CODART   = DPED.CODART
                WHERE PED.PEDIDO = @idPedido
            `);
        return result.recordset;
    } catch (error) {
        console.error("Error al consultar SQL Server:", error);
        throw error;
    }
};

export const registrarLogEnvio = async (idPedido, email, estado, numeroIntento, usuario, totalArticulos) => {
    try {
        const pool = await poolPromise;
        if (!pool) return;
        await pool.request()
            .input('idReserva',  sql.Int,     idPedido)
            .input('cantidad',   sql.Int,     totalArticulos)
            .input('email',      sql.VarChar, email)
            .input('usuario',    sql.VarChar, usuario)
            .input('estado',     sql.VarChar, estado)
            .input('intentos',   sql.Int,     numeroIntento)
            .query(`
                INSERT INTO [Casa09].[dbo].[LOG_ENVIOS_MAIL] 
                (ID_RESERVA, CANTIDAD_ARTICULOS, EMAIL_DESTINO, USUARIO_EMISOR, ESTADO, INTENTOS, FECHA_ENVIO)
                VALUES (@idReserva, @cantidad, @email, @usuario, @estado, @intentos, GETDATE())
            `);
        console.log(`Pedido ${idPedido} registrado en log - Estado: ${estado}`);
    } catch (error) {
        console.error("ERROR EN EL LOG:", error.message);
    }
};