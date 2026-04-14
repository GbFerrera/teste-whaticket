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

@Table({
  tableName: "financeiro_categorias"
})
class FinanceiroCategoria extends Model<FinanceiroCategoria> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Company)
  @Column({ field: "company_id", type: DataType.BIGINT })
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @Column(DataType.STRING(100))
  nome: string;

  @Column(DataType.STRING(20))
  tipo: "despesa" | "receita";

  @Column({ field: "pai_id", type: DataType.BIGINT, allowNull: true })
  paiId: number | null;

  @ForeignKey(() => FinanceiroCategoria)
  @BelongsTo(() => FinanceiroCategoria, { foreignKey: "paiId" })
  pai: FinanceiroCategoria | null;

  @HasMany(() => FinanceiroCategoria, { foreignKey: "paiId" })
  filhos: FinanceiroCategoria[];

  @Column(DataType.STRING(7))
  cor: string;

  @Default(true)
  @Column(DataType.BOOLEAN)
  ativo: boolean;

  @CreatedAt
  @Column({ field: "created_at" })
  createdAt: Date;

  @UpdatedAt
  @Column({ field: "updated_at" })
  updatedAt: Date;
}

export default FinanceiroCategoria;
