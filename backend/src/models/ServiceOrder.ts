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
  AllowNull,
  CreatedAt,
  UpdatedAt
} from "sequelize-typescript";
import Company from "./Company";
import CrmClient from "./CrmClient";
import Ticket from "./Ticket";
import ServiceOrderItem from "./ServiceOrderItem";

@Table({ tableName: "ServiceOrders" })
class ServiceOrder extends Model<ServiceOrder> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Company)
  @AllowNull(false)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @ForeignKey(() => Ticket)
  @AllowNull(true)
  @Column
  ticketId: number | null;

  @BelongsTo(() => Ticket)
  ticket: Ticket | null;

  @ForeignKey(() => CrmClient)
  @AllowNull(false)
  @Column
  customerId: number;

  @BelongsTo(() => CrmClient)
  customer: CrmClient;

  @Default("aberta")
  @Column(DataType.STRING(30))
  status: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  garantiaFlag: boolean;

  @Column(DataType.INTEGER)
  garantiaPrazoDias: number | null;

  @Column(DataType.TEXT)
  garantiaDescricao: string | null;

  @Column(DataType.DATE)
  entregaPrevista: Date | null;

  @Column(DataType.STRING(30))
  pagamentoTipo: string | null;

  @Default(false)
  @Column(DataType.BOOLEAN)
  gerarFatura: boolean;

  @Column(DataType.STRING(120))
  pagamentoManualReferencia: string | null;

  @Column(DataType.TEXT)
  observacoesInternas: string | null;

  @Column(DataType.TEXT)
  observacoesCliente: string | null;

  @Default(0)
  @Column(DataType.DECIMAL(12, 2))
  subtotal: number;

  @Default(0)
  @Column(DataType.DECIMAL(12, 2))
  descontos: number;

  @Default(0)
  @Column(DataType.DECIMAL(12, 2))
  total: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @HasMany(() => ServiceOrderItem)
  items: ServiceOrderItem[];
}

export default ServiceOrder;
