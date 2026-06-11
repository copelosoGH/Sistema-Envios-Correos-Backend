import transporter from '../utils/mailer.js';

export const enviarCorreo = async (emailDestino, asunto, html, emailFrom, nombreFrom) => {
    const from = (emailFrom && nombreFrom)
        ? `"${nombreFrom}" <${emailFrom}>`
        : `"A Todo Color" <noreplyatc@atodocolor.com.ar>`;   // fallback

    const mailOptions = {
        from,
        to:      emailDestino,
        subject: asunto,
        html
    };
    return transporter.sendMail(mailOptions);
};