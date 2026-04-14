import AppError from "../../errors/AppError";
import Company from "../../models/Company";
import Affiliate from "../../models/Affiliate";
import AffiliateLink from "../../models/AffiliateLink";
import { generateAffiliateCode } from "../../utils/affiliateUtils";

interface Request {
  companyId: number;
  commissionRate?: number;
  minWithdrawAmount?: number;
}

const CreateAffiliateService = async ({
  companyId,
  commissionRate = 10.00,
  minWithdrawAmount = 50.00
}: Request): Promise<Affiliate> => {
  // Verificar se a empresa existe
  const company = await Company.findByPk(companyId);
  if (!company) {
    throw new AppError("Empresa não encontrada", 404);
  }

  // Verificar se já é afiliado
  const existingAffiliate = await Affiliate.findOne({
    where: { companyId }
  });
  if (existingAffiliate) {
    throw new AppError("Empresa já é afiliada", 400);
  }

  // Gerar código único de afiliado
  const affiliateCode = await generateAffiliateCode();

  // Criar afiliado
  const affiliate = await Affiliate.create({
    companyId,
    affiliateCode,
    commissionRate,
    minWithdrawAmount,
    totalEarned: 0,
    totalWithdrawn: 0,
    status: "active"
  });

  // Criar link de indicação padrão
  await AffiliateLink.create({
    affiliateId: affiliate.id,
    code: affiliateCode,
    url: `${process.env.FRONTEND_URL}/cadastro?aff=${affiliateCode}`,
    clicks: 0,
    signups: 0,
    conversions: 0,
    trackingData: {}
  });

  return affiliate;
};

export default CreateAffiliateService;
