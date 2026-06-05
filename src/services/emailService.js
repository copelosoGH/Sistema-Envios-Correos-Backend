import transporter from '../utils/mailer.js';

export const enviarArticulosPorMail = async (emailDestino, listaArticulos, idPedido, nombreCasa) => {
    const filasTabla = listaArticulos.map(art => `
        <tr>
            <td style="padding: 10px; border: 1px solid #ddd;">${art.CODART}</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${art.DESCRI}</td>
            <td style="padding: 10px; border: 1px solid #ddd; text-align: center; font-weight: bold;">${art.CANT}</td>
        </tr>
    `).join('');

    const mailOptions = {
        from: `"Sistema Gestcom" <deposito@atodocolor.com.ar>`,
        to: emailDestino,
        subject: `Pedido Nº ${idPedido} - ${nombreCasa} - ${new Date().toLocaleDateString()}`,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="color: #2c3e50;">Pedido Nº ${idPedido}</h2>
                <p>Destino: <strong>${nombreCasa}</strong></p>
                <p>Total de Articulos enviados: <strong>${listaArticulos.length}</strong></p>
                <p>Artículos del pedido:</p>
                <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                    <thead>
                        <tr style="background-color: #f8f9fa;">
                            <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Código</th>
                            <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Descripción</th>
                            <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">Cantidad</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filasTabla}
                    </tbody>
                </table>
                <p style="margin-top: 20px; font-size: 12px; color: #7f8c8d;">
                    Envío automático generado por el sistema Gestcom.
                </p>
            </div>
        `
    };

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error en transporter:", error);
                reject(error);
            } else {
                console.log("Email aceptado por el servidor de correo");
                resolve(info);
            }
        });
    });
};