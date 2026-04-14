import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  DataType,
  PrimaryKey,
  Default,
  BelongsTo,
  ForeignKey,
  AutoIncrement
} from "sequelize-typescript";
import User from "./User";
import Company from "./Company";

@Table
class MobileWebhook extends Model<MobileWebhook> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @Column(DataType.STRING)
  webhookUrl: string;

  @Column(DataType.STRING)
  deviceToken: string;

  @Column(DataType.ENUM("android", "ios"))
  platform: string;

  @Default(true)
  @Column
  isActive: boolean;

  @Default(0)
  @Column
  failureCount: number;

  @Column(DataType.DATE)
  lastUsed: Date;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default MobileWebhook;
