import * as Yup from "yup";
import AppError from "../../errors/AppError";
import CustomerWalletCustomer from "../../models/CustomerWalletCustomer";

interface WalletCustomerData {
  walletId: number;
  clientId: number;
  companyId: number;
}

const AddCustomerToWalletService = async (data: WalletCustomerData) => {
  const { walletId, clientId, companyId } = data;

  const schema = Yup.object().shape({
    walletId: Yup.number().required().positive().integer(),
    clientId: Yup.number().required().positive().integer(),
    companyId: Yup.number().required().positive().integer()
  });

  try {
    await schema.validate({ walletId, clientId, companyId });
  } catch (error) {
    throw new AppError(error.message);
  }

  // Verificar se cliente já está na carteira
  const existing = await CustomerWalletCustomer.findOne({
    where: {
      walletId,
      clientId,
      companyId
    }
  });

  if (existing) {
    throw new AppError("Cliente já está nesta carteira");
  }

  const walletCustomer = await CustomerWalletCustomer.create({
    walletId,
    clientId,
    companyId
  });

  return walletCustomer;
};

export default AddCustomerToWalletService;
