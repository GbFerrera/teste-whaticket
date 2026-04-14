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
import Company from "./Company";
import ProdutoVariacaoOpcao from "./ProdutoVariacaoOpcao";

@Table({
  tableName: "ProdutoVariacaoGrupos"
})
class ProdutoVariacaoGrupo extends Model<ProdutoVariacaoGrupo> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @Column(DataType.STRING(100))
  nome: string;

  @HasMany(() => ProdutoVariacaoOpcao, { as: "opcoes" })
  opcoes: ProdutoVariacaoOpcao[];
}

export default ProdutoVariacaoGrupo;
