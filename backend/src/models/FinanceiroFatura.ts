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
import CrmClient from "./CrmClient";
import Project from "./Project";
import FinanceiroPagamento from "./FinanceiroPagamento";
import { HasMany } from "sequelize-typescript";

@Table({
  tableName: "financeiro_faturas"
})
class FinanceiroFatura extends Model<FinanceiroFatura> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Company)
  @Column({ field: "company_id", type: DataType.BIGINT })
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @ForeignKey(() => CrmClient)
  @Column({ field: "client_id", type: DataType.BIGINT })
  clientId: number;

  @BelongsTo(() => CrmClient)
  client: CrmClient;

  @ForeignKey(() => Project)
  @Column({ field: "project_id", type: DataType.INTEGER })
  projectId: number | null;

  @BelongsTo(() => Project)
  project: Project;

  @Column(DataType.STRING(5000))
  descricao: string;

  @Column(DataType.DECIMAL(14, 2))
  valor: string;

  @Column({ field: "valor_pago", type: DataType.DECIMAL(14, 2), defaultValue: 0 })
  valorPago: string;

  @Default("aberta")
  @Column(DataType.STRING(20))
  status: "aberta" | "paga" | "vencida" | "cancelada";

  @Column({ field: "data_vencimento", type: DataType.DATEONLY })
  dataVencimento: Date;

  @Column({ field: "data_pagamento", type: DataType.DATE })
  dataPagamento: Date | null;

  @Column({ field: "tipo_referencia", type: DataType.STRING(20) })
  tipoReferencia: "servico" | "produto" | null;

  @Column({ field: "referencia_id", type: DataType.BIGINT })
  referenciaId: number | null;

  @Default("unica")
  @Column({ field: "tipo_recorrencia", type: DataType.STRING(20) })
  tipoRecorrencia: "unica" | "mensal" | "anual";

  @Column({ field: "quantidade_ciclos", type: DataType.INTEGER })
  quantidadeCiclos: number | null;

  @Default(1)
  @Column({ field: "ciclo_atual", type: DataType.INTEGER })
  cicloAtual: number;

  @Default(DataType.NOW)
  @Column({ field: "data_inicio", type: DataType.DATEONLY })
  dataInicio: Date;

  @Column({ field: "data_fim", type: DataType.DATEONLY })
  dataFim: Date | null;

  @Default(true)
  @Column(DataType.BOOLEAN)
  ativa: boolean;

  @Column(DataType.TEXT)
  observacoes: string | null;

  @Column({ field: "payment_provider", type: DataType.STRING })
  paymentProvider: string | null;

  @Column({ field: "payment_link", type: DataType.TEXT })
  paymentLink: string | null;

  @Column({ field: "payment_external_id", type: DataType.STRING })
  paymentExternalId: string | null;

  @Column({ field: "checkout_token", type: DataType.STRING })
  checkoutToken: string | null;

  @CreatedAt
  @Column({ field: "created_at", type: DataType.DATE })
  createdAt: Date;

  @UpdatedAt
  @Column({ field: "updated_at", type: DataType.DATE })
  updatedAt: Date;

  @HasMany(() => FinanceiroPagamento)
  pagamentos: FinanceiroPagamento[];
}

export default FinanceiroFatura;
