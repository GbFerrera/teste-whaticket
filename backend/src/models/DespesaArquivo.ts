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
  tableName: "despesas_arquivos"
})
class DespesaArquivo extends Model<DespesaArquivo> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column({ type: DataType.BIGINT })
  despesaId: number;

  @Column(DataType.STRING(500))
  arquivo: string;

  @Column(DataType.STRING(255))
  nomeOriginal: string;

  @Column(DataType.STRING(100))
  tipo: string;

  @Column(DataType.BIGINT)
  tamanho: number;

  @CreatedAt
  @Column
  createdAt: Date;

  @UpdatedAt
  @Column
  updatedAt: Date;
}

export default DespesaArquivo;
