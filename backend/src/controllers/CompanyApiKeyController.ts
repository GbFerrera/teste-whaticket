import { Request, Response } from "express";
import UpdateCompanyApiKeyService from "../services/CompanyApiKeyService/UpdateCompanyApiKeyService";

type UpdateCompanyApiKeyBody = {
  column: string;
  data: string;
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { column, data } = req.body as UpdateCompanyApiKeyBody;
  const { companyId } = req.user;

  try {
    const result = await UpdateCompanyApiKeyService({
      companyId,
      column,
      data
    });
    
    return res.status(200).json({ response: true, result });
  } catch (error) {
    console.error("[ERROR] CompanyApiKeyController.update:", error);
    return res.status(400).json({ error: "Failed to update API key" });
  }
};
