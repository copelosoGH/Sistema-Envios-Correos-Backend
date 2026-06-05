// src/controllers/emailController.js  (sin el log, por ahora)
import { getPlantilla } from '../services/plantillaService.js';
import { construirContexto, render } from '../services/renderService.js';
import { enviarCorreo } from '../services/emailService.js';

export const enviarCorreoDinamico = async (req, res) => {
    // Claves de control (las que el motor maneja aparte)
    const { idModelo, enviarCasa, emailSucursal, enviarMail, mail, ...resto } = req.body;

    // Todo lo demás que mande VB6 (idPedido, etc.) se vuelve params
    const params = resto;
    
    const MAX_INTENTOS = 3;

    try {
        if (!idModelo) return res.status(400).json({ error: "Falta el idModelo." });

        const plantilla = await getPlantilla(idModelo);
        if (!plantilla) return res.status(404).json({ error: `No existe la plantilla ${idModelo}.` });

        const contexto = await construirContexto(idModelo, params);
        console.log("PARAMS:", params);
console.log("CONTEXTO:", JSON.stringify(contexto, null, 2));

        const asunto = render(plantilla.ASUNTO, contexto);
        const html   = render(plantilla.CUERPO, contexto);

        let destinos = [];
        if (enviarCasa === true && emailSucursal?.trim()) destinos.push(emailSucursal.trim());
        if (enviarMail === true && mail?.trim())          destinos.push(mail.trim());
        destinos = [...new Set(destinos)];

        if (destinos.length === 0) return res.status(400).json({ error: "No hay email destino válido." });
        const emailDestino = destinos.join(",");

        let enviado = false, intentoActual = 0;
        while (intentoActual < MAX_INTENTOS && !enviado) {
            intentoActual++;
            try {
                await enviarCorreo(emailDestino, asunto, html);
                enviado = true;
                console.log(`Correo enviado a ${emailDestino} con asunto "${asunto}".`);
                console.log(`Correo enviado en intento ${intentoActual}`);
            } catch (error) {
                console.error(`Fallo intento ${intentoActual} de ${MAX_INTENTOS}`);
                if (intentoActual < MAX_INTENTOS) await new Promise(r => setTimeout(r, 2000));
            }
        }

        if (enviado) res.json({ message: `Correo enviado a ${emailDestino}.` });
        else res.status(500).json({ error: "No se pudo enviar tras 3 intentos." });

    } catch (error) {
        console.error("DETALLE DEL ERROR:", error.message);
        res.status(500).json({ error: "Error interno del servidor.", detalle: error.message });
    }
};