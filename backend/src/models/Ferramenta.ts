// @ts-nocheck
import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import Company from "./Company";

@Table({
  tableName: "Ferramentas"
})
class Ferramenta extends Model<Ferramenta> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column(DataType.STRING(255))
  nome: string;

  @Column(DataType.TEXT)
  descricao: string | null;

  @Column(DataType.TEXT)
  url: string;

  @Column(DataType.STRING(10))
  metodo: string; // GET, POST, PUT, DELETE

  @Column(DataType.JSONB)
  headers: any | null;

  @Column(DataType.JSONB)
  body: any | null;

  @Column(DataType.JSONB)
  query_params: any | null;

  @Column(DataType.JSONB)
  placeholders: any | null;

  @Column({ type: DataType.STRING(20), defaultValue: "ativo" })
  status: string;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @CreatedAt
  @Column
  createdAt: Date;

  @UpdatedAt
  @Column
  updatedAt: Date;
}

export default Ferramenta;
