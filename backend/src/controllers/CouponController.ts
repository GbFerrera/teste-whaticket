import { Request, Response } from "express";
import AppError from "../errors/AppError";
import Coupon from "../models/Coupon";
import { validateCoupon as validateCouponUtil } from "../utils/affiliateUtils";

// Validar cupom (público)
export const validateCoupon = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { code } = req.params;
    const { planAmount } = req.query;

    if (!code) {
      return res.status(400).json({ error: "Código do cupom não fornecido" });
    }

    const validation = await validateCouponUtil(code, parseFloat(planAmount as string));
    return res.json(validation);
  } catch (error) {
    console.error("Error validating coupon:", error);
    return res.status(500).json({ error: "Erro interno" });
  }
};

// Listar cupons (super admin)
export const listCoupons = async (req: Request, res: Response): Promise<Response> => {
  try {
    const coupons = await Coupon.findAll({
      order: [["createdAt", "DESC"]]
    });

    return res.json(coupons);
  } catch (error) {
    console.error("Error listing coupons:", error);
    return res.status(500).json({ error: "Erro interno" });
  }
};

// Criar cupom (super admin)
export const createCoupon = async (req: Request, res: Response): Promise<Response> => {
  try {
    const {
      name,
      code,
      discountType = "percentage",
      discountValue,
      minPlanAmount = 0,
      maxUses,
      validUntil,
      isActive = true,
      description
    } = req.body;

    // Verificar se código já existe
    const existingCoupon = await Coupon.findOne({
      where: { code: code.toUpperCase() }
    });

    if (existingCoupon) {
      return res.status(400).json({ error: "Código de cupom já existe" });
    }

    const coupon = await Coupon.create({
      name,
      code: code.toUpperCase(),
      discountType,
      discountValue,
      minPlanAmount,
      maxUses,
      usedCount: 0,
      validUntil,
      isActive,
      description
    });

    return res.status(201).json(coupon);
  } catch (error) {
    console.error("Error creating coupon:", error);
    return res.status(500).json({ error: "Erro interno" });
  }
};

// Atualizar cupom (super admin)
export const updateCoupon = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const {
      name,
      code,
      discountType,
      discountValue,
      minPlanAmount,
      maxUses,
      validUntil,
      isActive,
      description
    } = req.body;

    const coupon = await Coupon.findByPk(id);
    if (!coupon) {
      return res.status(404).json({ error: "Cupom não encontrado" });
    }

    // Se estiver atualizando o código, verificar se já existe
    if (code && code !== coupon.code) {
      const existingCoupon = await Coupon.findOne({
        where: { code: code.toUpperCase() }
      });

      if (existingCoupon) {
        return res.status(400).json({ error: "Código de cupom já existe" });
      }
    }

    await coupon.update({
      name: name || coupon.name,
      code: code ? code.toUpperCase() : coupon.code,
      discountType: discountType || coupon.discountType,
      discountValue: discountValue || coupon.discountValue,
      minPlanAmount: minPlanAmount !== undefined ? minPlanAmount : coupon.minPlanAmount,
      maxUses: maxUses !== undefined ? maxUses : coupon.maxUses,
      validUntil: validUntil || coupon.validUntil,
      isActive: isActive !== undefined ? isActive : coupon.isActive,
      description: description !== undefined ? description : coupon.description
    });

    return res.json(coupon);
  } catch (error) {
    console.error("Error updating coupon:", error);
    return res.status(500).json({ error: "Erro interno" });
  }
};

// Deletar cupom (super admin)
export const deleteCoupon = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findByPk(id);
    if (!coupon) {
      return res.status(404).json({ error: "Cupom não encontrado" });
    }

    await coupon.destroy();

    return res.status(204).send();
  } catch (error) {
    console.error("Error deleting coupon:", error);
    return res.status(500).json({ error: "Erro interno" });
  }
};
