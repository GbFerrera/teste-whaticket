// @ts-nocheck
import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  UpdatedAt,
  HasMany
} from "sequelize-typescript";

import Company from "./Company";
import Produto from "./Produto";

@Table({
  tableName: "ProdutoCategorias"
})
class ProdutoCategoria extends Model<ProdutoCategoria> {
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

  @AllowNull(false)
  @Column(DataType.STRING(255))
  nome: string;

  @AllowNull(true)
  @Column(DataType.STRING(255))
  slug: string | null;

  @AllowNull(true)
  @Column(DataType.TEXT)
  descricao: string | null;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @HasMany(() => Produto)
  produtos: Produto[];
}

export default ProdutoCategoria;
