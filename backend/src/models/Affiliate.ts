import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  DataType,
  Default,
  HasMany
} from "sequelize-typescript";
import Company from "./Company";

@Table
class Affiliate extends Model<Affiliate> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @Column({ unique: true })
  affiliateCode: string;

  @Column(DataType.DECIMAL(5, 2))
  commissionRate: number; // Percentual de comissão (ex: 10.00 = 10%)

  @Column(DataType.DECIMAL(10, 2))
  minWithdrawAmount: number; // Valor mínimo para saque

  @Column(DataType.DECIMAL(10, 2))
  totalEarned: number;

  @Column(DataType.DECIMAL(10, 2))
  totalWithdrawn: number;

  @Default("active")
  @Column(DataType.ENUM("active", "inactive", "suspended"))
  status: string;

  // Relationships are defined in the related models to avoid circular dependencies

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default Affiliate;
