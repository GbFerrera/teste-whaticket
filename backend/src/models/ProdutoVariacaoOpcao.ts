// @ts-nocheck
import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  HasMany
} from "sequelize-typescript";
import ProdutoVariacaoGrupo from "./ProdutoVariacaoGrupo";
import ProdutoVariacaoItem from "./ProdutoVariacaoItem";

@Table({
  tableName: "ProdutoVariacaoOpcoes"
})
class ProdutoVariacaoOpcao extends Model<ProdutoVariacaoOpcao> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => ProdutoVariacaoGrupo)
  @Column
  grupoId: number;

  @BelongsTo(() => ProdutoVariacaoGrupo)
  grupo: ProdutoVariacaoGrupo;

  @Column(DataType.STRING(100))
  nome: string;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  ordem: number;

  @HasMany(() => ProdutoVariacaoItem)
  itens: ProdutoVariacaoItem[];
}

export default ProdutoVariacaoOpcao;
