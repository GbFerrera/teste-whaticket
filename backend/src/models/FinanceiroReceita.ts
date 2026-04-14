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
import FinanceiroFornecedor from "./FinanceiroFornecedor";
import FinanceiroCategoria from "./FinanceiroCategoria";

@Table({
  tableName: "financeiro_receitas",
  timestamps: true
})
export default class FinanceiroReceita extends Model<FinanceiroReceita> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Company)
  @Column({ field: "company_id" })
  companyId: number;

  @ForeignKey(() => FinanceiroFornecedor)
  @Column({ field: "fornecedor_id", allowNull: true })
  fornecedorId: number | null;

  @BelongsTo(() => FinanceiroFornecedor)
  fornecedor: FinanceiroFornecedor | null;

  @ForeignKey(() => FinanceiroCategoria)
  @Column({ field: "categoria_id", allowNull: true })
  categoriaId: number | null;

  @BelongsTo(() => FinanceiroCategoria)
  categoria: FinanceiroCategoria | null;

  @Column(DataType.STRING(255))
  descricao: string;

  @Column({ type: DataType.DECIMAL(14, 2) })
  valor: number;

  @Column({ type: DataType.DECIMAL(14, 2), defaultValue: 0 })
  valorRecebido: number;

  @Column(DataType.STRING(20))
  status: "aberto" | "recebido" | "vencido" | "cancelado";

  @Column({ field: "data_vencimento", type: DataType.DATE })
  dataVencimento: Date;

  @Column({ field: "data_pagamento", type: DataType.DATE, allowNull: true })
  dataPagamento: Date | null;

  @Column({ field: "metodo_pagamento_previsto", type: DataType.STRING(50), allowNull: true })
  metodoPagamentoPrevisto: string | null;

  @Column({ field: "metodo_pagamento_real", type: DataType.STRING(50), allowNull: true })
  metodoPagamentoReal: string | null;

  @Column(DataType.TEXT)
  observacoes: string | null;

  @Column({ field: "anexo_url", type: DataType.STRING(500), allowNull: true })
  anexoUrl: string | null;

  @Column({ defaultValue: false })
  recorrente: boolean;

  @Column({ field: "data_inicio", type: DataType.DATE, allowNull: true })
  dataInicio: Date | null;

  @Column({ field: "data_fim", type: DataType.DATE, allowNull: true })
  dataFim: Date | null;

  @Column({ field: "tipo_recorrencia", type: DataType.STRING(20), defaultValue: "mensal", allowNull: true })
  tipoRecorrencia: "diario" | "semanal" | "mensal" | "anual" | null;

  @Column({ field: "quantidade_ciclos", type: DataType.INTEGER, allowNull: true })
  quantidadeCiclos: number | null;

  @Column({ field: "ciclo_atual", type: DataType.INTEGER, defaultValue: 1 })
  cicloAtual: number;

  @CreatedAt
  @Column({ field: "created_at" })
  createdAt: Date;

  @UpdatedAt
  @Column({ field: "updated_at" })
  updatedAt: Date;

  @BelongsTo(() => Company)
  company: Company;
}
