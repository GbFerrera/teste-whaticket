import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  HasMany,
  Default,
  CreatedAt,
  UpdatedAt
} from "sequelize-typescript";
import Company from "./Company";
import CompanyIntegrationFieldMap from "./CompanyIntegrationFieldMap";

@Table({
  tableName: "company_integration_settings"
})
class CompanyIntegrationSetting extends Model<CompanyIntegrationSetting> {
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
  name: string;

  @Column(DataType.STRING)
  provider: string | null;

  @Column({ field: "base_url", type: DataType.STRING })
  baseUrl: string | null;

  @Column({ field: "api_key", type: DataType.TEXT })
  apiKey: string | null;

  @Column({ field: "api_secret", type: DataType.TEXT })
  apiSecret: string | null;

  @Column({ field: "webhook_secret", type: DataType.TEXT })
  webhookSecret: string | null;

  @Column(DataType.JSONB)
  metadata: Record<string, any> | null;

  @Default(true)
  @Column(DataType.BOOLEAN)
  active: boolean;

  @HasMany(() => CompanyIntegrationFieldMap)
  fieldMaps: CompanyIntegrationFieldMap[];

  @CreatedAt
  @Column(DataType.DATE)
  createdAt: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt: Date;
}

export default CompanyIntegrationSetting;
