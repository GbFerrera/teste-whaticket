import * as Yup from "yup";
import AppError from "../errors/AppError";
import CustomerWallet from "../models/CustomerWallet";
import CustomerWalletCustomer from "../models/CustomerWalletCustomer";
import CustomerWalletUser from "../models/CustomerWalletUser";
import CrmClient from "../models/CrmClient";
import User from "../models/User";
import { getIO } from "../libs/socket";

interface WalletData {
  name: string;
  description?: string;
  companyId: number;
  isActive?: boolean;
}

interface WalletCustomerData {
  walletId: number;
  clientId: number;
  companyId: number;
}

interface WalletUserData {
  walletId: number;
  userId: number;
  companyId: number;
  isActive?: boolean;
}

class CustomerWalletService {
  // ========== CARTEIRAS ==========

  async create(walletData: WalletData) {
    const schema = Yup.object().shape({
      name: Yup.string().required().min(3).max(255),
      description: Yup.string().optional(),
      companyId: Yup.number().required().positive().integer(),
      isActive: Yup.boolean().optional()
    });

    try {
      await schema.validate(walletData);
    } catch (error) {
      throw new AppError(error.message);
    }

    const wallet = await CustomerWallet.create(walletData);
    return wallet;
  }

  async findWalletsByCompany(companyId: number) {
    const wallets = await CustomerWallet.findAll({
      where: { companyId, isActive: true },
      include: [
        {
          model: CustomerWalletCustomer,
          as: "walletCustomers",
          include: [
            {
              model: CrmClient,
              as: "client"
            }
          ]
        },
        {
          model: CustomerWalletUser,
          as: "walletUsers",
          include: [
            {
              model: User,
              as: "user"
            }
          ]
        }
      ],
      order: [["name", "ASC"]]
    });

    return wallets;
  }

  async findWalletById(id: number, companyId: number) {
    const wallet = await CustomerWallet.findOne({
      where: { id, companyId },
      include: [
        {
          model: CustomerWalletCustomer,
          as: "walletCustomers",
          include: [
            {
              model: CrmClient,
              as: "client"
            }
          ]
        },
        {
          model: CustomerWalletUser,
          as: "walletUsers",
          include: [
            {
              model: User,
              as: "user"
            }
          ]
        }
      ]
    });

    if (!wallet) {
      throw new AppError("Carteira não encontrada");
    }

    return wallet;
  }

  async update(id: number, walletData: Partial<WalletData>, companyId: number) {
    const wallet = await this.findWalletById(id, companyId);

    await wallet.update(walletData);
    return wallet;
  }

  async delete(id: number, companyId: number) {
    const wallet = await this.findWalletById(id, companyId);
    
    // Soft delete - apenas desativa
    await wallet.update({ isActive: false });
    
    return { message: "Carteira desativada com sucesso" };
  }

  // ========== CLIENTES NAS CARTEIRAS ==========

  async addCustomerToWallet(walletCustomerData: WalletCustomerData) {
    const schema = Yup.object().shape({
      walletId: Yup.number().required().positive().integer(),
      clientId: Yup.number().required().positive().integer(),
      companyId: Yup.number().required().positive().integer()
    });

    try {
      await schema.validate(walletCustomerData);
    } catch (error) {
      throw new AppError(error.message);
    }

    // Verificar se cliente já está na carteira
    const existing = await CustomerWalletCustomer.findOne({
      where: {
        walletId: walletCustomerData.walletId,
        clientId: walletCustomerData.clientId,
        companyId: walletCustomerData.companyId
      }
    });

    if (existing) {
      throw new AppError("Cliente já está nesta carteira");
    }

    const walletCustomer = await CustomerWalletCustomer.create(walletCustomerData);
    return walletCustomer;
  }

  async removeCustomerFromWallet(walletId: number, clientId: number, companyId: number) {
    const walletCustomer = await CustomerWalletCustomer.findOne({
      where: { walletId, clientId, companyId }
    });

    if (!walletCustomer) {
      throw new AppError("Cliente não encontrado nesta carteira");
    }

    await walletCustomer.destroy();
    return { message: "Cliente removido da carteira com sucesso" };
  }

  async getWalletCustomers(walletId: number, companyId: number) {
    const customers = await CustomerWalletCustomer.findAll({
      where: { walletId, companyId },
      include: [
        {
          model: CrmClient,
          as: "client"
        }
      ],
      order: [[{ model: CrmClient, as: "client" }, "name", "ASC"]]
    });

    return customers;
  }

  // ========== USUÁRIOS NAS CARTEIRAS ==========

  async addUserToWallet(walletUserData: WalletUserData) {
    const schema = Yup.object().shape({
      walletId: Yup.number().required().positive().integer(),
      userId: Yup.number().required().positive().integer(),
      companyId: Yup.number().required().positive().integer(),
      isActive: Yup.boolean().optional()
    });

    try {
      await schema.validate(walletUserData);
    } catch (error) {
      throw new AppError(error.message);
    }

    // Verificar se usuário já está na carteira
    const existing = await CustomerWalletUser.findOne({
      where: {
        walletId: walletUserData.walletId,
        userId: walletUserData.userId,
        companyId: walletUserData.companyId
      }
    });

    if (existing) {
      throw new AppError("Usuário já está nesta carteira");
    }

    const walletUser = await CustomerWalletUser.create(walletUserData);
    return walletUser;
  }

  async removeUserFromWallet(walletId: number, userId: number, companyId: number) {
    const walletUser = await CustomerWalletUser.findOne({
      where: { walletId, userId, companyId }
    });

    if (!walletUser) {
      throw new AppError("Usuário não encontrado nesta carteira");
    }

    await walletUser.destroy();
    return { message: "Usuário removido da carteira com sucesso" };
  }

  async getWalletUsers(walletId: number, companyId: number) {
    const users = await CustomerWalletUser.findAll({
      where: { walletId, companyId, isActive: true },
      include: [
        {
          model: User,
          as: "user"
        }
      ],
      order: [[{ model: User, as: "user" }, "name", "ASC"]]
    });

    return users;
  }

  // ========== MÉTODOS ÚTEIS ==========

  async getUserWallets(userId: number, companyId: number) {
    const walletUsers = await CustomerWalletUser.findAll({
      where: { userId, companyId, isActive: true },
      include: [
        {
          model: CustomerWallet,
          as: "wallet",
          where: { isActive: true },
          include: [
            {
              model: CustomerWalletCustomer,
              as: "walletCustomers",
              include: [
                {
                  model: CrmClient,
                  as: "client"
                }
              ]
            }
          ]
        }
      ]
    });

    return walletUsers.map(wu => wu.wallet);
  }

  async getCustomerWallets(clientId: number, companyId: number) {
    const walletCustomers = await CustomerWalletCustomer.findAll({
      where: { clientId, companyId },
      include: [
        {
          model: CustomerWallet,
          as: "wallet",
          where: { isActive: true }
        }
      ]
    });

    return walletCustomers.map(wc => wc.wallet);
  }
}

export default new CustomerWalletService();
