import { getPlantilla } from '../services/plantillaService.js';
import { construirContexto, render } from '../services/renderService.js';
import { getMailCasa } from '../services/casaService.js';
import { enviarCorreo } from '../services/emailService.js';

export const enviarCorreoDinamico = async (req, res) => {
    console.log('RECEPCION URL: ',req.body);

    // Claves de control que maneja el motor; todo lo demás cae en params.
    const {
        idModelo,
        enviarCasa, emailSucursal,   // caso pedido (compatibilidad)
        enviarMail, mail,            // mail manual (acepta varios separados por coma)
        casa,                        // numero de sucursal -> resuelve mail + nombre
        ...resto
    } = req.body;

    const params = resto;
    const MAX_INTENTOS = 3;

    try {
        // 1) Validar y traer la plantilla
        if (!idModelo) {
            return res.status(400).json({ error: "Falta el idModelo." });
        }

        const plantilla = await getPlantilla(idModelo);
        if (!plantilla) {
            return res.status(404).json({ error: `No existe la plantilla ${idModelo}.` });
        }

        // 2) Construir el contexto base (params + funciones del modelo)
        const contexto = await construirContexto(idModelo, params);

        // 3) Resolver destinatarios
        let destinos = [];

        // 3a) Por numero de casa: resuelve mail Y nombre de sucursal
        if (casa) {
            const info = await getMailCasa(casa);

            if (!info) {
                return res.status(404).json({ error: `No existe la casa ${casa}.` });
            }
            if (info.inactivo) {
                return res.status(400).json({
                    error: `La casa ${casa} (${info.denominacion}) está inactiva.`
                });
            }
            if (!info.mail?.trim()) {
                return res.status(400).json({
                    error: `La casa ${casa} (${info.denominacion}) no tiene email cargado.`
                });
            }

            destinos.push(info.mail.trim());
            contexto.sucursalNombre = info.denominacion;  // disponible como {{sucursalNombre}}
        }

        // 3b) Mail manual (uno o varios separados por coma - Opcion A)
        if (enviarMail === true && mail?.trim()) {
            destinos.push(mail.trim());
        }

        // 3c) Caso pedido original (compatibilidad)
        if (enviarCasa === true && emailSucursal?.trim()) {
            destinos.push(emailSucursal.trim());
        }

        destinos = [...new Set(destinos)];
        if (destinos.length === 0) {
            return res.status(400).json({ error: "No hay email destino válido." });
        }
        const emailDestino = destinos.join(",");

        // 4) Render (DESPUES de meter sucursalNombre en el contexto)
        const asunto = render(plantilla.ASUNTO, contexto);
        const html   = render(plantilla.CUERPO, contexto);

        // 5) Envio con reintentos
        let enviado = false;
        let intentoActual = 0;

        while (intentoActual < MAX_INTENTOS && !enviado) {
            intentoActual++;
            try {
                await enviarCorreo(emailDestino, asunto, html, plantilla.EMAIL_FROM, plantilla.NOMBRE_FROM);
                enviado = true;
                console.log(`Correo enviado en intento ${intentoActual} a: ${emailDestino}`);
            } catch (error) {
                console.error(`Fallo intento ${intentoActual} de ${MAX_INTENTOS}:`, error.message);
                if (intentoActual < MAX_INTENTOS) {
                    await new Promise(r => setTimeout(r, 2000));
                }
            }
        }

        if (enviado) {
            res.json({ message: `Correo enviado a ${emailDestino}.` });
        } else {
            res.status(500).json({ error: "No se pudo enviar el correo tras 3 intentos." });
        }

    } catch (error) {
        console.error("DETALLE DEL ERROR:", error.message);
        res.status(500).json({ error: "Error interno del servidor.", detalle: error.message });
    }
};