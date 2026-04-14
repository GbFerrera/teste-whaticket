import CustomerWallet from "../../models/CustomerWallet";

interface ListWalletsData {
  companyId: number;
}

const ListWalletsService = async ({ companyId }: ListWalletsData) => {
  const wallets = await CustomerWallet.findAll({
    where: { companyId, isActive: true },
    include: [
      {
        association: "walletCustomers",
        include: [
          {
            association: "client"
          }
        ]
      },
      {
        association: "walletUsers",
        include: [
          {
            association: "user"
          }
        ]
      }
    ],
    order: [["name", "ASC"]]
  });

  return wallets;
};

export default ListWalletsService;
