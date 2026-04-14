import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  DataType,
  Default,
  BelongsTo
} from "sequelize-typescript";
import Company from "./Company";
import Invoices from "./Invoices";
import FinanceiroFatura from "./FinanceiroFatura";

@Table
class AffiliateCommission extends Model<AffiliateCommission> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  affiliateId: number;

  @ForeignKey(() => Company)
  @Column
  referredCompanyId: number;

  @ForeignKey(() => Invoices)
  @Column
  invoiceId: number;

  @ForeignKey(() => FinanceiroFatura)
  @Column
  faturaId: number;

  @Column(DataType.DECIMAL(10, 2))
  commissionAmount: number;

  @Column(DataType.DECIMAL(5, 2))
  commissionRate: number;

  @Default("pending")
  @Column(DataType.ENUM("pending", "approved", "paid", "cancelled"))
  status: string;

  @Column(DataType.TEXT)
  notes?: string;

  @Column(DataType.JSON)
  metadata?: any;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @Column
  paidAt?: Date;

  @BelongsTo(() => Company, { foreignKey: "referredCompanyId" })
  referredCompany: Company;

  @BelongsTo(() => Invoices)
  invoice: Invoices;

  @BelongsTo(() => FinanceiroFatura)
  fatura: FinanceiroFatura;
}

export default AffiliateCommission;
