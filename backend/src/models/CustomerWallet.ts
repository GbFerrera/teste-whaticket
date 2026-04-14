import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Default,
  ForeignKey,
  BelongsTo,
  HasMany
} from "sequelize-typescript";

import Company from "./Company";
import CustomerWalletCustomer from "./CustomerWalletCustomer";
import CustomerWalletUser from "./CustomerWalletUser";

@Table({
  tableName: "CustomerWallets"
})
class CustomerWallet extends Model<CustomerWallet> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id!: number;

  @AllowNull(false)
  @Column
  name!: string;

  @Column
  description?: string;

  @ForeignKey(() => Company)
  @AllowNull(false)
  @Column
  companyId!: number;

  @Default(true)
  @Column
  isActive!: boolean;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @BelongsTo(() => Company)
  company!: Company;

  @HasMany(() => CustomerWalletCustomer, { foreignKey: "walletId", as: "walletCustomers" })
  walletCustomers?: CustomerWalletCustomer[];

  @HasMany(() => CustomerWalletUser, { foreignKey: "walletId", as: "walletUsers" })
  walletUsers?: CustomerWalletUser[];
}

export default CustomerWallet;
