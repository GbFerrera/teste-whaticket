import * as crypto from "crypto";
import Affiliate from "../models/Affiliate";

export const generateAffiliateCode = async (): Promise<string> => {
  let code: string;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;

  do {
    // Gerar código de 6 caracteres alfanuméricos
    code = crypto.randomBytes(3).toString('hex').toUpperCase();
    
    // Verificar se já existe
    const existing = await Affiliate.findOne({
      where: { affiliateCode: code }
    });
    
    isUnique = !existing;
    attempts++;
    
    if (attempts >= maxAttempts) {
      // Se não conseguir único após várias tentativas, usar timestamp
      code = `AFF${Date.now().toString(36).toUpperCase()}`;
      isUnique = true;
    }
  } while (!isUnique);

  return code;
};

export const calculateCommission = (
  invoiceAmount: number,
  commissionRate: number
): number => {
  return (invoiceAmount * commissionRate) / 100;
};

export const validateCoupon = async (
  code: string,
  planAmount: number
): Promise<{ valid: boolean; discountAmount?: number; error?: string }> => {
  const Coupon = require("../models/Coupon").default;
  
  const coupon = await Coupon.findOne({
    where: {
      code: code.toUpperCase(),
      isActive: true
    }
  });

  if (!coupon) {
    return { valid: false, error: "Cupom inválido" };
  }

  // Verificar validade
  if (coupon.validUntil && new Date() > coupon.validUntil) {
    return { valid: false, error: "Cupom expirado" };
  }

  // Verificar usos máximos
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, error: "Cupom esgotado" };
  }

  // Verificar valor mínimo
  if (coupon.minPlanAmount && planAmount < coupon.minPlanAmount) {
    return { valid: false, error: `Valor mínimo de R$ ${coupon.minPlanAmount}` };
  }

  // Calcular desconto
  let discountAmount: number;
  if (coupon.discountType === "percentage") {
    discountAmount = (planAmount * coupon.discountValue) / 100;
  } else {
    discountAmount = coupon.discountValue;
  }

  return { valid: true, discountAmount };
};
