import { Request, Response } from "express";

import AppError from "../errors/AppError";
import { getAsaasSecondCopyByCpf } from "../services/PaymentGatewayService";

export const secondCopyByCpf = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const cpf = (req.body?.cpf || req.query?.cpf || "").toString();

  if (!companyId) {
    throw new AppError("Empresa não identificada.", 400);
  }

  if (!cpf) {
    throw new AppError("Informe o CPF do cliente.", 400);
  }

  const data = await getAsaasSecondCopyByCpf(companyId, cpf);

  return res.json({
    message: "Segunda via obtida com sucesso.",
    data
  });
};

export default { secondCopyByCpf };
