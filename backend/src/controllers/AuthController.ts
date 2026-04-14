import { Request, Response } from "express";
import AffiliateLink from "../models/AffiliateLink";

export const checkAffiliate = async (req: Request, res: Response): Promise<Response> => {
  const { code } = req.params;

  if (!code) {
    return res.status(400).json({ error: "Código de afiliado não fornecido" });
  }

  try {
    const affiliateLink = await AffiliateLink.findOne({
      where: { code: code.toUpperCase() }
    });

    if (!affiliateLink) {
      return res.status(404).json({ error: "Link de afiliado não encontrado" });
    }

    const affiliate = await affiliateLink.getAffiliate();
    if (!affiliate || affiliate.status !== "active") {
      return res.status(400).json({ error: "Afiliado inativo" });
    }

    return res.json({
      valid: true,
      affiliateCode: affiliateLink.code,
      affiliateId: affiliateLink.affiliateId
    });
  } catch (error) {
    console.error("Error checking affiliate:", error);
    return res.status(500).json({ error: "Erro interno" });
  }
};
