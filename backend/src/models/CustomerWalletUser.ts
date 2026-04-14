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
  BelongsTo,
  Default
} from "sequelize-typescript";

import CustomerWallet from "./CustomerWallet";
import User from "./User";
import Company from "./Company";

@Table({
  tableName: "CustomerWalletUsers"
})
class CustomerWalletUser extends Model<CustomerWalletUser> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id!: number;

  @ForeignKey(() => CustomerWallet)
  @AllowNull(false)
  @Column
  walletId!: number;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column
  userId!: number;

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

  @BelongsTo(() => CustomerWallet, { as: "wallet" })
  wallet!: CustomerWallet;

  @BelongsTo(() => User, { as: "user" })
  user!: User;

  @BelongsTo(() => Company, { as: "company" })
  company!: Company;
}

export default CustomerWalletUser;
