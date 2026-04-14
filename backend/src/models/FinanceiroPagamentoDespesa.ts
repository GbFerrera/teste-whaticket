import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  CreatedAt
} from "sequelize-typescript";
import Company from "./Company";
import FinanceiroDespesa from "./FinanceiroDespesa";

@Table({
  tableName: "financeiro_pagamentos_despesas"
})
class FinanceiroPagamentoDespesa extends Model<FinanceiroPagamentoDespesa> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Company)
  @Column({ field: "company_id", type: DataType.BIGINT })
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @ForeignKey(() => FinanceiroDespesa)
  @Column({ field: "despesa_id", type: DataType.BIGINT })
  despesaId: number;

  @BelongsTo(() => FinanceiroDespesa)
  despesa: FinanceiroDespesa;

  @Column({ field: "metodo_pagamento", type: DataType.STRING(50) })
  metodoPagamento: string;

  @Column({ type: DataType.DECIMAL(14, 2) })
  valor: number;

  @Column({ field: "data_pagamento", type: DataType.DATE })
  dataPagamento: Date;

  @Column(DataType.TEXT)
  observacoes: string | null;

  @Column({ field: "anexo_url", type: DataType.STRING(500), allowNull: true })
  anexoUrl: string | null;

  @CreatedAt
  @Column({ field: "created_at" })
  createdAt: Date;
}

export default FinanceiroPagamentoDespesa;
