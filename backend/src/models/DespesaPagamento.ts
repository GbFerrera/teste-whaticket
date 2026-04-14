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
  tableName: "despesas_pagamentos"
})
class DespesaPagamento extends Model<DespesaPagamento> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column({ field: "despesaid", type: DataType.BIGINT })
  despesaId: number;

  @Column({ field: "datapagamento", type: DataType.DATEONLY })
  dataPagamento: Date;

  @Column({ type: DataType.DECIMAL(14, 2) })
  valorPago: number;

  @Column({ field: "formapagamento", type: DataType.STRING(50) })
  formaPagamento: string;

  @Column(DataType.TEXT)
  observacoes: string | null;

  @CreatedAt
  @Column
  createdAt: Date;

  @UpdatedAt
  @Column
  updatedAt: Date;
}

export default DespesaPagamento;
