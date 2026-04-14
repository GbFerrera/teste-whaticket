import { Request, Response } from "express";
import { SendMail } from "../helpers/SendMail";

export const sendCrmEmail = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { nome, email, telefone, empresa, segmento, mensagem } = req.body;

    // Montar HTML do email
    const htmlContent = `
      <h2>Nova Solicitação de CRM Personalizado</h2>
      <p><strong>Nome:</strong> ${nome}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Telefone:</strong> ${telefone}</p>
      <p><strong>Empresa:</strong> ${empresa}</p>
      <p><strong>Segmento:</strong> ${segmento}</p>
      <p><strong>Mensagem:</strong></p>
      <p>${mensagem}</p>
      <hr>
      <p><small>Enviado via formulário do dashboard</small></p>
    `;

    // Usar a função SendMail existente
    await SendMail({
      to: "rafaeloficialpaixao@gmail.com",
      subject: `Solicitação CRM - ${empresa}`,
      html: htmlContent
    });

    return res.status(200).json({ message: "Email enviado com sucesso!" });
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    return res.status(500).json({ error: "Erro ao enviar email" });
  }
};
