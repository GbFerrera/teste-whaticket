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
  tableName: "financeiro_fornecedores"
})
class FinanceiroFornecedor extends Model<FinanceiroFornecedor> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Company)
  @Column({ field: "company_id", type: DataType.BIGINT })
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @Column(DataType.STRING(150))
  nome: string;

  @Column(DataType.STRING(30))
  documento: string | null;

  @Column(DataType.STRING(150))
  email: string | null;

  @Column(DataType.STRING(30))
  telefone: string | null;

  @Column(DataType.STRING(255))
  endereco: string | null;

  @Column(DataType.STRING(20))
  numero: string | null;

  @Column(DataType.STRING(100))
  complemento: string | null;

  @Column(DataType.STRING(100))
  bairro: string | null;

  @Column(DataType.STRING(100))
  cidade: string | null;

  @Column(DataType.STRING(2))
  estado: string | null;

  @Column(DataType.STRING(10))
  cep: string | null;

  @Column(DataType.STRING(50))
  categoria: string | null;

  @Column(DataType.TEXT)
  observacoes: string | null;

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

export default FinanceiroFornecedor;
