// @ts-nocheck
import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  PrimaryKey,
  AutoIncrement,
  HasMany
} from "sequelize-typescript";
import Company from "./Company";
import ProdutoCategoria from "./ProdutoCategoria";
import ProdutoVariacaoItem from "./ProdutoVariacaoItem";

@Table({
  tableName: "Produtos"
})
class Produto extends Model<Produto> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @ForeignKey(() => ProdutoCategoria)
  @Column
  categoriaId: number | null;

  @BelongsTo(() => ProdutoCategoria)
  categoria: ProdutoCategoria | null;

  @Column(DataType.STRING(20))
  tipo: string;

  @Column(DataType.STRING(255))
  nome: string;

  @Column(DataType.TEXT)
  descricao: string | null;

  @Column(DataType.DECIMAL(12, 2))
  valor: number;

  @Column({ type: DataType.STRING(20), defaultValue: "disponivel" })
  status: string;

  @Column(DataType.TEXT)
  imagem_principal: string | null;

  @Column(DataType.JSONB)
  galeria: any | null;

  @Column(DataType.JSONB)
  dados_especificos: any | null;

  @Column({ type: DataType.BOOLEAN, field: "controleEstoque", defaultValue: false })
  controleEstoque: boolean;

  @Column({ type: DataType.INTEGER, field: "estoqueAtual", defaultValue: 0 })
  estoqueAtual: number;

  @Column({ type: DataType.INTEGER, field: "estoqueMinimo", defaultValue: 0 })
  estoqueMinimo: number;

  @HasMany(() => ProdutoVariacaoItem)
  variacoes: ProdutoVariacaoItem[];
}

export default Produto;
