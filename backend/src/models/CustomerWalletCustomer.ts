import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";

import CustomerWallet from "./CustomerWallet";
import Company from "./Company";
import CrmClient from "./CrmClient";

@Table({
  tableName: "CustomerWalletCustomers"
})
class CustomerWalletCustomer extends Model<CustomerWalletCustomer> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id!: number;

  @ForeignKey(() => CustomerWallet)
  @AllowNull(false)
  @Column
  walletId!: number;

  @ForeignKey(() => CrmClient)
  @AllowNull(false)
  @Column
  clientId!: number;

  @ForeignKey(() => Company)
  @AllowNull(false)
  @Column
  companyId!: number;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @BelongsTo(() => CustomerWallet, { as: "wallet" })
  wallet!: CustomerWallet;

  @BelongsTo(() => CrmClient, { as: "client" })
  client!: CrmClient;

  @BelongsTo(() => Company, { as: "company" })
  company!: Company;
}

export default CustomerWalletCustomer;
