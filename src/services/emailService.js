// src/services/emailService.js
import transporter from '../utils/mailer.js';

export const enviarCorreo = async (emailDestino, asunto, html) => {
    const mailOptions = {
        from: `"Sistema Gestcom" <deposito@atodocolor.com.ar>`,
        to: emailDestino,
        subject: asunto,
        html: html
    };
    // nodemailer ya devuelve una promesa; no hace falta envolverla a mano
    return transporter.sendMail(mailOptions);
};