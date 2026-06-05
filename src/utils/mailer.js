import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const transporter = nodemailer.createTransport({
    host: "smtp.envialosimple.email",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false,
    },
});

transporter.verify().then(() => {
    console.log('Listo para enviar correos.');
}).catch(err => {
    console.error('Error en mailer:', err);
});

export default transporter;