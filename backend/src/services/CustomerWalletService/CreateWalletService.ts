import * as Yup from "yup";
import AppError from "../../errors/AppError";
import CustomerWallet from "../../models/CustomerWallet";

interface WalletData {
  name: string;
  description?: string;
  companyId: number;
  isActive?: boolean;
}

const CreateWalletService = async (data: WalletData): Promise<any> => {
  const { name, description, companyId, isActive } = data;

  const schema = Yup.object().shape({
    name: Yup.string().required().min(3).max(255),
    description: Yup.string().optional(),
    companyId: Yup.number().required().positive().integer(),
    isActive: Yup.boolean().optional()
  });

  try {
    await schema.validate({ name, description, companyId, isActive });
  } catch (error) {
    throw new AppError(error.message);
  }

  const wallet = await CustomerWallet.create({
    name,
    description,
    companyId,
    isActive: isActive !== undefined ? isActive : true
  });

  return wallet;
};

export default CreateWalletService;
