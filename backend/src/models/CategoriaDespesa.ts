import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  Default,
  CreatedAt,
  UpdatedAt
} from "sequelize-typescript";

@Table({
  tableName: "categorias_despesas"
})
class CategoriaDespesa extends Model<CategoriaDespesa> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column({ type: DataType.BIGINT })
  companyId: number;

  @Column(DataType.STRING(100))
  nome: string;

  @Column(DataType.STRING(7))
  cor: string;

  @Column(DataType.TEXT)
  descricao: string | null;

  @Default(true)
  @Column(DataType.BOOLEAN)
  ativo: boolean;

  @CreatedAt
  @Column
  createdAt: Date;

  @UpdatedAt
  @Column
  updatedAt: Date;
}

export default CategoriaDespesa;
