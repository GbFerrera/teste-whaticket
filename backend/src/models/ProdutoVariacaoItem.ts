// @ts-nocheck
import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import Produto from "./Produto";
import ProdutoVariacaoOpcao from "./ProdutoVariacaoOpcao";

@Table({
  tableName: "ProdutoVariacaoItens"
})
class ProdutoVariacaoItem extends Model<ProdutoVariacaoItem> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Produto)
  @Column
  produtoId: number;

  @BelongsTo(() => Produto)
  produto: Produto;

  @ForeignKey(() => ProdutoVariacaoOpcao)
  @Column
  opcaoId: number;

  @BelongsTo(() => ProdutoVariacaoOpcao)
  opcao: ProdutoVariacaoOpcao;

  @Column({ type: DataType.DECIMAL(12, 2), allowNull: true, field: "valorOverride" })
  valorOverride: number | null;

  @Column({ type: DataType.INTEGER, allowNull: true, field: "estoqueOverride" })
  estoqueOverride: number | null;
}

export default ProdutoVariacaoItem;
