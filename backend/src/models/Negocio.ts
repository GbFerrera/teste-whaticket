// @ts-nocheck
import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  PrimaryKey,
  AutoIncrement
} from "sequelize-typescript";
import Company from "./Company";

@Table({
  tableName: "Negocios"
})
class Negocio extends Model<Negocio> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @Column
  name: string;

  @Column(DataType.TEXT)
  description: string | null;

  @Column(DataType.JSONB)
  kanbanBoards: any | null;

  @Column(DataType.JSONB)
  users: any | null;
}

export default Negocio;
