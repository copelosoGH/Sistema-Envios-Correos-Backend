import { getArticulosConEmail, registrarLogEnvio } from "../services/articuloService.js";
import { enviarArticulosPorMail } from "../services/emailService.js";

export const enviarArticulos = async (req, res) => {
    console.log(req.body);
    
    const { idPedido, enviarCasa, emailSucursal, enviarMail, mail } = req.body;
    const MAX_INTENTOS = 3;

    try {
        if (!idPedido) {
            return res.status(400).json({ error: "Falta el idPedido." });
        }

        const listaArticulos = await getArticulosConEmail(idPedido);

        if (listaArticulos.length === 0) {
            return res.status(404).json({
                error: `No se encontraron artículos para el pedido ${idPedido}.`
            });
        }

        const nombreCasa = listaArticulos[0].NombreCasa || "Destino";

        // ARMAR DESTINOS
        let destinos = [];

        if (enviarCasa === true && emailSucursal && emailSucursal.trim() !== "") {
            destinos.push(emailSucursal.trim());
        }

        // "mail" en minúscula
        if (enviarMail === true && mail && mail.trim() !== "") {
            destinos.push(mail.trim());
        }

        destinos = [...new Set(destinos)];

        if (destinos.length === 0) {
            return res.status(400).json({ error: "No hay email destino válido." });
        }

        const emailDestino = destinos.join(",");

        console.log(
            `Pedido ${idPedido} → ${nombreCasa} | Envio de mail a: ${emailDestino} | ${new Date().toLocaleString()}`
        );

        let enviado       = false;
        let intentoActual = 0;

        while (intentoActual < MAX_INTENTOS && !enviado) {
            intentoActual++;
            try {
                await enviarArticulosPorMail(emailDestino, listaArticulos, idPedido, nombreCasa);
                enviado = true;
                console.log(`Correo enviado en intento ${intentoActual}`);
            } catch (error) {
                console.error(`Fallo intento ${intentoActual} de ${MAX_INTENTOS}`);
                if (intentoActual < MAX_INTENTOS) {
                    await new Promise((resolve) => setTimeout(resolve, 2000));
                }
            }
        }

        await registrarLogEnvio(
            idPedido,
            emailDestino,
            enviado ? "SUCCESS" : "FAILED_FINAL",
            intentoActual,
            "Deposito",
            listaArticulos.length
        );

        if (enviado) {
            res.json({
                message: `Correo enviado a ${nombreCasa} (${emailDestino}). ${listaArticulos.length} artículo(s).`
            });
        } else {
            res.status(500).json({ error: "No se pudo enviar el correo tras 3 intentos." });
        }

    } catch (error) {
        console.error("DETALLE DEL ERROR:", error.message);
        res.status(500).json({ error: "Error interno del servidor.", detalle: error.message });
    }
};