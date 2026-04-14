import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import Company from "./Company";
import Contact from "./Contact";

@Table({ tableName: "Faturas" })
class Fatura extends Model<Fatura> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @ForeignKey(() => Contact)
  @Column
  contactId: number;

  @Column
  valor: number;

  @Column
  descricao: string;

  @Column
  status: string; // pendente, paga, cancelada, vencida, falha, recorrente_ativa

  @Column
  dataCriacao: Date;

  @Column
  dataVencimento: Date;

  @Column
  dataPagamento: Date;

  @Column
  recorrente: boolean;

  @Column
  intervalo: string | null;

  @Column
  proximaCobranca: Date | null;

  @Column
  limiteRecorrencias: number | null;

  @Column
  recorrenciasRealizadas: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @BelongsTo(() => Company)
  company: Company;

  @BelongsTo(() => Contact)
  contact: Contact;
}

export default Fatura;
