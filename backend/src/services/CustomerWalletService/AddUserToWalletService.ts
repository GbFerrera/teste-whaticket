import * as Yup from "yup";
import AppError from "../../errors/AppError";
import CustomerWalletUser from "../../models/CustomerWalletUser";

interface WalletUserData {
  walletId: number;
  userId: number;
  companyId: number;
  isActive?: boolean;
}

const AddUserToWalletService = async (data: WalletUserData) => {
  const { walletId, userId, companyId, isActive } = data;

  const schema = Yup.object().shape({
    walletId: Yup.number().required().positive().integer(),
    userId: Yup.number().required().positive().integer(),
    companyId: Yup.number().required().positive().integer(),
    isActive: Yup.boolean().optional()
  });

  try {
    await schema.validate({ walletId, userId, companyId, isActive });
  } catch (error) {
    throw new AppError(error.message);
  }

  // Verificar se usuário já está na carteira
  const existing = await CustomerWalletUser.findOne({
    where: {
      walletId,
      userId,
      companyId
    }
  });

  if (existing) {
    throw new AppError("Usuário já está nesta carteira");
  }

  const walletUser = await CustomerWalletUser.create({
    walletId,
    userId,
    companyId,
    isActive: isActive !== undefined ? isActive : true
  });

  return walletUser;
};

export default AddUserToWalletService;
