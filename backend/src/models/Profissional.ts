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

@Table({ tableName: "profissionais" })
class Profissional extends Model<Profissional> {
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

  @AllowNull(false)
  @Column({
    type: DataType.JSONB,
    defaultValue: []
  })
  servicos: any[];

  @AllowNull(false)
  @Column({
    type: DataType.JSONB,
    defaultValue: {}
  })
  agenda: Record<string, unknown>;

  @AllowNull(false)
  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true
  })
  ativo: boolean;

  @AllowNull(false)
  @Column({
    type: DataType.DECIMAL(10, 2),
    defaultValue: 0
  })
  comissao: number;

  @AllowNull(false)
  @Column({
    type: DataType.DECIMAL(12, 2),
    defaultValue: 0
  })
  valorEmAberto: number;

  @AllowNull(false)
  @Column({
    type: DataType.DECIMAL(12, 2),
    defaultValue: 0
  })
  valoresRecebidos: number;

  @AllowNull(false)
  @Column({
    type: DataType.DECIMAL(12, 2),
    defaultValue: 0
  })
  valoresAReceber: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default Profissional;
