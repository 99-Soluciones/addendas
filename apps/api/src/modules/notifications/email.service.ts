import { Injectable } from "@nestjs/common";
import nodemailer from "nodemailer";
import type { SMTPSentMessageInfo } from "nodemailer";
import { env } from "../../config/env.js";
import { BadRequestError } from "../../utils/http-errors.js";

interface SendAddendaArgs {
  to: string;
  asunto: string;
  cuerpo: string;
  xml: string;
  filename: string;
}

interface SendPasswordResetArgs {
  to: string;
  nombre: string;
  resetUrl: string;
}

@Injectable()
export class EmailService {
  isConfigured(): boolean {
    return Boolean(env.SMTP_HOST);
  }

  private createTransport() {
    if (!this.isConfigured()) {
      throw new BadRequestError("El envío por correo no está configurado (define SMTP_* en .env).");
    }
    return nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
    });
  }

  async sendAddenda({
    to,
    asunto,
    cuerpo,
    xml,
    filename,
  }: SendAddendaArgs): Promise<SMTPSentMessageInfo> {
    const transport = this.createTransport();
    const html = this.htmlLayout(`
      <p style="margin:0 0 16px;font-size:15px;color:#1a1a1a;">${cuerpo}</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
        <tr>
          <td style="background:#f7f7f8;border:1px solid #e2e2e6;border-radius:8px;padding:16px;">
            <p style="margin:0 0 4px;font-size:12px;color:#6b6b72;text-transform:uppercase;letter-spacing:.05em;">Archivo adjunto</p>
            <p style="margin:0;font-size:14px;color:#1a1a1a;font-weight:600;">${filename}</p>
          </td>
        </tr>
      </table>
      <p style="margin:0;font-size:13px;color:#6b6b72;">Si tienes dudas, contacta a <a href="mailto:contact@builtbysori.me">contact@builtbysori.me</a>.</p>
    `);
    const response = await transport.sendMail({
      from: env.SMTP_FROM,
      to,
      subject: asunto,
      text: cuerpo,
      html,
      attachments: [{ filename, content: xml, contentType: "application/xml" }],
    });
    return response;
  }

  async sendPasswordReset({
    to,
    nombre,
    resetUrl,
  }: SendPasswordResetArgs): Promise<SMTPSentMessageInfo> {
    const transport = this.createTransport();
    const textCuerpo = [
      `Hola ${nombre},`,
      "",
      "Recibimos una solicitud para restablecer la contraseña de tu cuenta en Addendex.",
      "Abre el siguiente enlace para elegir una nueva contraseña (válido por 1 hora):",
      "",
      resetUrl,
      "",
      "Si no solicitaste este cambio, ignora este mensaje; tu contraseña no se modificará.",
    ].join("\n");
    const html = this.htmlLayout(`
      <p style="margin:0 0 8px;font-size:15px;color:#1a1a1a;">Hola <strong>${nombre}</strong>,</p>
      <p style="margin:0 0 24px;font-size:15px;color:#1a1a1a;">
        Recibimos una solicitud para restablecer la contraseña de tu cuenta.
        Haz clic en el botón para elegir una nueva (el enlace es válido por <strong>1 hora</strong>).
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
        <tr>
          <td style="border-radius:6px;background:#b01e28;">
            <a href="${resetUrl}"
               style="display:inline-block;padding:12px 28px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:6px;">
              Restablecer contraseña
            </a>
          </td>
        </tr>
      </table>
      <p style="margin:0 0 8px;font-size:13px;color:#6b6b72;">
        Si el botón no funciona, copia y pega esta URL en tu navegador:
      </p>
      <p style="margin:0 0 24px;font-size:12px;color:#6b6b72;word-break:break-all;">${resetUrl}</p>
      <p style="margin:0;font-size:13px;color:#6b6b72;">
        Si no solicitaste este cambio, ignora este mensaje; tu contraseña no se modificara.
      </p>
    `);
    const response = await transport.sendMail({
      from: env.SMTP_FROM,
      to,
      subject: "Restablece tu contrasena - Addendex",
      text: textCuerpo,
      html,
    });
    return response;
  }

  private htmlLayout(content: string): string {
    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Addendex</title>
</head>
<body style="margin:0;padding:0;background:#f7f7f8;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
         style="background:#f7f7f8;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
               style="max-width:560px;">
          <!-- Header -->
          <tr>
            <td style="background:#b01e28;border-radius:8px 8px 0 0;padding:24px 32px;">
              <p style="margin:0;font-size:18px;font-weight:700;color:#ffffff;letter-spacing:.03em;">
                Addendex
              </p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:32px;border-left:1px solid #e2e2e6;border-right:1px solid #e2e2e6;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f7f7f8;border:1px solid #e2e2e6;border-top:none;border-radius:0 0 8px 8px;padding:16px 32px;">
              <p style="margin:0;font-size:12px;color:#6b6b72;text-align:center;">
                Este mensaje fue generado automaticamente por Addendex. Por favor no respondas a este correo.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }
}
