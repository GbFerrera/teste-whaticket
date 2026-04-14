import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  UpdatedAt
} from "sequelize-typescript";
import CompanyIntegrationSetting from "./CompanyIntegrationSetting";

@Table({
  tableName: "company_integration_field_maps"
})
class CompanyIntegrationFieldMap extends Model<CompanyIntegrationFieldMap> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id: number;

  @ForeignKey(() => CompanyIntegrationSetting)
  @Column({ field: "integration_id", type: DataType.INTEGER })
  integrationId: number;

  @BelongsTo(() => CompanyIntegrationSetting)
  integration: CompanyIntegrationSetting;

  @Column({ field: "external_field", type: DataType.STRING })
  externalField: string;

  @Column({ field: "crm_field", type: DataType.STRING })
  crmField: string | null;

  @Column({ field: "transform_expression", type: DataType.TEXT })
  transformExpression: string | null;

  @Column(DataType.JSONB)
  options: Record<string, any> | null;

  @CreatedAt
  @Column({ field: "created_at", type: DataType.DATE })
  createdAt: Date;

  @UpdatedAt
  @Column({ field: "updated_at", type: DataType.DATE })
  updatedAt: Date;
}

export default CompanyIntegrationFieldMap;
