import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  DataType,
  CreatedAt,
  Default
} from "sequelize-typescript";
import Company from "./Company";
import FinanceiroFatura from "./FinanceiroFatura";

@Table({
  tableName: "financeiro_pagamentos",
  timestamps: false
})
class FinanceiroPagamento extends Model<FinanceiroPagamento> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Company)
  @Column({ field: "company_id", type: DataType.BIGINT })
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @ForeignKey(() => FinanceiroFatura)
  @Column({ field: "fatura_id", type: DataType.BIGINT })
  faturaId: number;

  @BelongsTo(() => FinanceiroFatura)
  fatura: FinanceiroFatura;

  @Column({ field: "metodo_pagamento", type: DataType.STRING(20) })
  metodoPagamento: "pix" | "cartao" | "boleto" | "transferencia" | "dinheiro" | "manual";

  @Column(DataType.DECIMAL(14, 2))
  valor: string;

  @Default(DataType.NOW)
  @Column({ field: "data_pagamento", type: DataType.DATE })
  dataPagamento: Date;

  @Column(DataType.TEXT)
  observacoes: string | null;

  @CreatedAt
  @Column({ field: "created_at", type: DataType.DATE })
  createdAt: Date;
}

export default FinanceiroPagamento;
