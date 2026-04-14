import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  HasMany,
  Default
} from "sequelize-typescript";
import { DataTypes } from "sequelize";
import Company from "./Company";
import AutomationAction from "./AutomationAction";
import AutomationLog from "./AutomationLog";
import AutomationExecution from "./AutomationExecution";

@Table({ tableName: "Automations" })
class Automation extends Model<Automation> {
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

  @Column(DataTypes.TEXT)
  description: string;

  @Column
  triggerType: string;

  @Default({})
  @Column(DataTypes.JSONB)
  triggerConfig: any;

  @Default(true)
  @Column
  isActive: boolean;

  @HasMany(() => AutomationAction)
  actions: AutomationAction[];

  @HasMany(() => AutomationLog)
  logs: AutomationLog[];

  @HasMany(() => AutomationExecution)
  executions: AutomationExecution[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default Automation;
