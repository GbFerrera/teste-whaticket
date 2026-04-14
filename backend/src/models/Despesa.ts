import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  CreatedAt,
  UpdatedAt
} from "sequelize-typescript";

@Table({
  tableName: "despesas"
})
class Despesa extends Model<Despesa> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column({ type: DataType.BIGINT })
  companyId: number;

  @Column({ type: DataType.BIGINT, allowNull: true })
  categoriaId: number | null;

  @Column({ type: DataType.BIGINT, allowNull: true })
  contatoId: number | null;

  @Column({ type: DataType.STRING(255) })
  titulo: string;

  @Column({ type: DataType.DECIMAL(14, 2) })
  valor: number;

  @Column({ type: DataType.DATE })
  dataVencimento: Date;

  @Column({ type: DataType.STRING(20), defaultValue: 'pendente' })
  status: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  recorrente: boolean;

  @Column({ type: DataType.STRING(20), defaultValue: 'mensal' })
  tipoRecorrencia: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  observacoes: string | null;

  @CreatedAt
  @Column
  createdAt: Date;

  @UpdatedAt
  @Column
  updatedAt: Date;
}

export default Despesa;
