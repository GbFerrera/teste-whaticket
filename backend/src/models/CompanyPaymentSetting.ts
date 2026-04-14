import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  Default,
  CreatedAt,
  UpdatedAt
} from "sequelize-typescript";
import Company from "./Company";

@Table({
  tableName: "company_payment_settings"
})
class CompanyPaymentSetting extends Model<CompanyPaymentSetting> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

  @ForeignKey(() => Company)
  @Column({ field: "company_id", type: DataType.INTEGER })
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @Column(DataType.STRING)
  provider: string;

  @Column(DataType.TEXT)
  token: string;

  @Column({ field: "additional_data", type: DataType.JSONB })
  additionalData: any;

  @Default(true)
  @Column(DataType.BOOLEAN)
  active: boolean;

  @CreatedAt
  @Column({ field: "created_at", type: DataType.DATE })
  createdAt: Date;

  @UpdatedAt
  @Column({ field: "updated_at", type: DataType.DATE })
  updatedAt: Date;
}

export default CompanyPaymentSetting;
