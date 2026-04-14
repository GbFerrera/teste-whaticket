import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
  BelongsTo,
  DataType
} from "sequelize-typescript";

import Company from "./Company";

@Table({ tableName: "servicos" })
class Servico extends Model<Servico> {
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
  @Column(DataType.STRING)
  nome: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  descricao: string | null;

  @AllowNull(false)
  @Column(DataType.DECIMAL(10, 2))
  valorOriginal: number;

  @AllowNull(false)
  @Column(DataType.BOOLEAN)
  possuiDesconto: boolean;

  @AllowNull(true)
  @Column(DataType.DECIMAL(10, 2))
  valorComDesconto: number | null;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default Servico;
