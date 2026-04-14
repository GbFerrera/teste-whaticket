import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as AffiliateController from "../controllers/AffiliateController";

const affiliateRoutes = Router();

// Rotas públicas
affiliateRoutes.get("/check-affiliate/:code", AffiliateController.checkAffiliate);

// Rotas do afiliado (requer autenticação)
affiliateRoutes.get("/my-info", isAuth, AffiliateController.getMyAffiliateInfo);
affiliateRoutes.get("/my-links", isAuth, AffiliateController.getMyLinks);
affiliateRoutes.post("/generate-link", isAuth, AffiliateController.generateLink);
affiliateRoutes.delete("/links/:linkId", isAuth, AffiliateController.deleteLink);
affiliateRoutes.get("/my-referrals", isAuth, AffiliateController.getMyReferrals);
affiliateRoutes.get("/commissions", isAuth, AffiliateController.getMyCommissions);
affiliateRoutes.get("/commissions/stats", isAuth, AffiliateController.getCommissionStats);
affiliateRoutes.get("/withdrawals", isAuth, AffiliateController.getMyWithdrawals);
affiliateRoutes.post("/withdrawals", isAuth, AffiliateController.requestWithdrawal);

// Rotas do super admin
affiliateRoutes.get("/detail/:id", isAuth, AffiliateController.getAffiliateById);
affiliateRoutes.get("/stats", isAuth, AffiliateController.getAffiliateStats);
affiliateRoutes.get("/commissions/admin", isAuth, AffiliateController.listAllCommissions);
affiliateRoutes.put("/commissions/:id", isAuth, AffiliateController.updateCommission);
affiliateRoutes.get("/withdrawals/admin", isAuth, AffiliateController.listAllWithdrawals);
affiliateRoutes.get("/withdrawals/stats", isAuth, AffiliateController.getWithdrawalStats);
affiliateRoutes.put("/withdrawals/:id", isAuth, AffiliateController.processWithdrawal);
affiliateRoutes.get("/", isAuth, AffiliateController.listAffiliates);
affiliateRoutes.post("/", isAuth, AffiliateController.createAffiliate);
affiliateRoutes.put("/:id", isAuth, AffiliateController.updateAffiliate);
affiliateRoutes.delete("/:id", isAuth, AffiliateController.deleteAffiliate);

export default affiliateRoutes;
