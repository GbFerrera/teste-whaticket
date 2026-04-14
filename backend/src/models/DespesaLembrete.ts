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
  tableName: "despesas_lembretes"
})
class DespesaLembrete extends Model<DespesaLembrete> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column({ type: DataType.BIGINT })
  despesaId: number;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  diasAntes: number;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  notificarWhatsapp: boolean;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  notificarEmail: boolean;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  notificarSistema: boolean;

  @Column(DataType.TEXT)
  mensagem: string | null;

  @Default(false)
  @Column(DataType.BOOLEAN)
  enviado: boolean;

  @Column({ type: DataType.DATE, allowNull: true })
  dataEnvio: Date | null;

  @CreatedAt
  @Column
  createdAt: Date;

  @UpdatedAt
  @Column
  updatedAt: Date;
}

export default DespesaLembrete;
